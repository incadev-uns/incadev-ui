import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";
import { config as evaluationConfig } from "@/config/evaluation-config";
import { Loader2 } from "lucide-react";

interface SurveyQuestion {
  id: number;
  survey_id: number;
  question: string;
  order: number;
  created_at: string;
  updated_at: string;
}

interface APISurvey {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  questions: SurveyQuestion[];
  mapping: {
    id: number;
    event: string;
    survey_id: number;
    description: string;
    created_at: string;
    updated_at: string;
  };
}

interface SurveyFormProps {
  survey: APISurvey;
  groupId: string;
  event: string;
  onClose: () => void;
  onSubmit: () => void;
}

interface Answer {
  question_id: number;
  score: number;
}

export function SurveyForm({ survey, groupId, event, onClose, onSubmit }: SurveyFormProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { token } = useAcademicAuth();

  const totalQuestions = survey.questions.length;
  const answeredQuestions = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const handleAnswerChange = (questionId: number, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (answeredQuestions < totalQuestions) {
      toast({
        title: "Encuesta incompleta",
        description: `Por favor responde todas las preguntas. Te faltan ${totalQuestions - answeredQuestions} pregunta(s).`,
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      // Preparar respuestas en el formato esperado
      const answersPayload: Answer[] = Object.entries(answers).map(([questionId, score]) => ({
        question_id: parseInt(questionId),
        score: score
      }));

      const payload = {
        rateable_id: parseInt(groupId),
        answers: answersPayload
      };

      const response = await fetch(
        `${evaluationConfig.apiUrl}${evaluationConfig.endpoints.surveys.response.replace(':id', survey.id.toString())}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      toast({
        title: "¡Encuesta enviada!",
        description: "Gracias por tu tiempo. Tus respuestas han sido registradas exitosamente.",
      });
      
      onSubmit();
      
    } catch (error) {
      console.error("Error enviando encuesta:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al enviar la encuesta",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Ordenar preguntas por el campo 'order'
  const sortedQuestions = [...survey.questions].sort((a, b) => a.order - b.order);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progreso de la encuesta</span>
          <span className="font-medium">{answeredQuestions}/{totalQuestions} preguntas</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {sortedQuestions.map((question, index) => (
          <div key={question.id} className="space-y-4 p-4 rounded-lg border bg-card">
            <Label className="text-base font-medium">
              {index + 1}. {question.question}
              <span className="text-destructive ml-1">*</span>
            </Label>
            
            <RadioGroup
              value={answers[question.id]?.toString() || ""}
              onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
              className="flex flex-col space-y-3"
            >
              {[1, 2, 3, 4, 5].map((score) => (
                <div key={score} className="flex items-center space-x-3 p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem 
                    value={score.toString()} 
                    id={`${question.id}-${score}`}
                    className="shrink-0"
                  />
                  <Label 
                    htmlFor={`${question.id}-${score}`}
                    className="flex-1 cursor-pointer font-normal text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {score === 1 && "Muy insatisfecho"}
                        {score === 2 && "Insatisfecho"}
                        {score === 3 && "Neutral"}
                        {score === 4 && "Satisfecho"}
                        {score === 5 && "Muy satisfecho"}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        ({score} punto{score !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Encuesta"
          )}
        </Button>
      </div>
    </form>
  );
}