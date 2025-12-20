import { config as marketingConfig } from '../../config/marketing-config';

// ============================================
// TYPES
// ============================================

/**
 * Respuesta de generación de texto
 */
export interface GenerateTextResponse {
    success: boolean;
    text?: string;
    error?: string;
}

/**
 * Respuesta de generación de imagen
 */
export interface GenerateImageResponse {
    success: boolean;
    text?: string;
    imageUrl?: string;
    imageId?: string;
    error?: string;
}

// ============================================
// TEXT GENERATION
// ============================================

/**
 * Genera texto para una plataforma específica usando Gemini
 * 
 * @param prompt - Descripción de lo que se quiere generar
 * @param platform - 'facebook' | 'instagram'
 * @param tone - Tono del contenido (professional, casual, formal, friendly, urgent)
 * @returns Texto generado por la IA
 */
export async function generateText(
    prompt: string,
    platform: 'facebook' | 'instagram',
    tone: string = 'professional'
): Promise<GenerateTextResponse> {
    try {
        const baseUrl = marketingConfig.generationApiUrl;
        const endpoint = platform === 'facebook'
            ? marketingConfig.endpoints.generation.facebook
            : marketingConfig.endpoints.generation.instagram;

        const url = `${baseUrl}${endpoint}`;

        console.log('[generationService] Generating text:', { url, platform, tone });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                tone,
                length: platform === 'instagram' ? 'short' : 'medium',
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Gemini retorna: { success: true, payload: { candidates: [...] } }
        if (data.success && data.payload?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const generatedText = data.payload.candidates[0].content.parts[0].text;

            console.log('[generationService] Text generated successfully');

            return {
                success: true,
                text: generatedText,
            };
        }

        return {
            success: false,
            error: data.body || 'No se pudo generar el texto',
        };

    } catch (error) {
        console.error('[generationService] Error generating text:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error de conexión',
        };
    }
}

// ============================================
// IMAGE GENERATION
// ============================================

/**
 * Genera una imagen usando Gemini Imagen y retorna texto + URL de imagen
 * 
 * @param prompt - Descripción de la imagen a generar
 * @param platform - 'facebook' | 'instagram' (para generar texto acorde)
 * @param tone - Tono del texto que acompaña la imagen
 * @param options - Opciones adicionales (aspectRatio, numberOfImages, etc)
 * @returns Texto generado + URL de la imagen
 */
export async function generateImage(
    prompt: string,
    platform: 'facebook' | 'instagram',
    tone: string = 'professional',
    options: {
        aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
        numberOfImages?: number;
        imageSize?: '1K' | '2K';
    } = {}
): Promise<GenerateImageResponse> {
    try {
        const baseUrl = marketingConfig.generationApiUrl;
        const imageEndpoint = marketingConfig.endpoints.generation.image;
        const textEndpoint = platform === 'facebook'
            ? marketingConfig.endpoints.generation.facebook
            : marketingConfig.endpoints.generation.instagram;

        // 1️⃣ Primero generar el TEXTO
        console.log('[generationService] Step 1: Generating text for image post');

        const textResponse = await fetch(`${baseUrl}${textEndpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                tone,
                length: platform === 'instagram' ? 'short' : 'medium',
            }),
        });

        if (!textResponse.ok) {
            throw new Error(`Error generating text: ${textResponse.status}`);
        }

        const textData = await textResponse.json();
        const generatedText = textData.success && textData.payload?.candidates?.[0]?.content?.parts?.[0]?.text
            ? textData.payload.candidates[0].content.parts[0].text
            : '';

        if (!generatedText) {
            return {
                success: false,
                error: 'No se pudo generar el texto',
            };
        }

        console.log('[generationService] Text generated, now generating image');

        // 2️⃣ Ahora generar la IMAGEN
        const imagePayload: any = {
            prompt, // El prompt original para la imagen
            aspectRatio: options.aspectRatio || (platform === 'instagram' ? '1:1' : '16:9'),
            numberOfImages: options.numberOfImages || 1,
        };

        if (options.imageSize) {
            imagePayload.imageSize = options.imageSize;
        }

        const imageResponse = await fetch(`${baseUrl}${imageEndpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(imagePayload),
        });

        if (!imageResponse.ok) {
            throw new Error(`Error generating image: ${imageResponse.status}`);
        }

        const imageData = await imageResponse.json();

        // Backend retorna: { success: true, payload: { saved_images: [{ id, url, ... }] } }
        if (imageData.success && imageData.payload?.saved_images?.[0]?.url) {
            const savedImage = imageData.payload.saved_images[0];

            console.log('[generationService] Image generated successfully:', savedImage.url);

            return {
                success: true,
                text: generatedText,
                imageUrl: savedImage.url,
                imageId: savedImage.id,
            };
        }

        return {
            success: false,
            error: imageData.body || 'No se pudo generar la imagen',
        };

    } catch (error) {
        console.error('[generationService] Error generating image:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error de conexión',
        };
    }
}