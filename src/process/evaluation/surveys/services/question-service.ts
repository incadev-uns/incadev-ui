import { config } from "@/config/evaluation-config"
import type { 
  Question, 
  QuestionFormData, 
  QuestionResponse, 
  QuestionListResponse 
} from "@/process/evaluation/surveys/types/question"

const getAuthToken = (): string => {
  const token = localStorage.getItem("token") || ""
  return token.replace(/^"|"$/g, "")
}

const headers = () => ({
  "Authorization": `Bearer ${getAuthToken()}`,
  "Content-Type": "application/json",
})

export const questionService = {
  async listAll(surveyId: number): Promise<QuestionListResponse> {
    const url = `${config.apiUrl}${config.endpoints.questions.listAll}`
      .replace(":surveyId", String(surveyId))
    const res = await fetch(url, { method: "GET", headers: headers() })
    if (!res.ok) throw new Error("Error al obtener preguntas")
    return res.json()
  },

  async show(id: number): Promise<QuestionResponse<Question>> {
    const url = `${config.apiUrl}${config.endpoints.questions.show}`
      .replace(":id", String(id))
    const res = await fetch(url, { method: "GET", headers: headers() })
    if (!res.ok) throw new Error("Error al obtener pregunta")
    return res.json()
  },

  async create(surveyId: number, data: QuestionFormData): Promise<QuestionResponse<Question>> {
    const url = `${config.apiUrl}${config.endpoints.questions.create}`
      .replace(":surveyId", String(surveyId))
    const res = await fetch(url, { 
      method: "POST", 
      headers: headers(), 
      body: JSON.stringify(data) 
    })
    if (!res.ok) throw new Error("Error al crear pregunta")
    return res.json()
  },

  async update(id: number, data: QuestionFormData): Promise<QuestionResponse<Question>> {
    const url = `${config.apiUrl}${config.endpoints.questions.update}`
      .replace(":id", String(id))
    const res = await fetch(url, { 
      method: "PUT", 
      headers: headers(), 
      body: JSON.stringify(data) 
    })
    if (!res.ok) throw new Error("Error al actualizar pregunta")
    return res.json()
  },

  async delete(id: number): Promise<QuestionResponse<null>> {
    const url = `${config.apiUrl}${config.endpoints.questions.delete}`
      .replace(":id", String(id))
    const res = await fetch(url, { method: "DELETE", headers: headers() })
    if (!res.ok) throw new Error("Error al eliminar pregunta")
    return res.json()
  },
}