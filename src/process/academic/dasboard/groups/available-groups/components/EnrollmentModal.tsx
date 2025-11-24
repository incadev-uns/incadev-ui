import { Dialog, DialogContent } from "@/components/ui/dialog"
import { EnrollmentForm, type EnrollmentFormData } from "@/process/academic/dasboard/groups/available-groups/components/EnrollmentForm"

interface EnrollmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  groupName: string
  courseName: string
  token: string | null
  onEnrollmentSuccess: () => void
}

export function EnrollmentModal({
  open,
  onOpenChange,
  groupId,
  groupName,
  courseName,
  token,
  onEnrollmentSuccess
}: EnrollmentModalProps) {

  const handleSuccess = () => {
    onEnrollmentSuccess()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <EnrollmentForm
          groupId={groupId}
          groupName={groupName}
          courseName={courseName}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          token={token}
        />
      </DialogContent>
    </Dialog>
  )
}