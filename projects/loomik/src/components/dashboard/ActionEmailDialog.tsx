import { useState, useRef } from "react";
import { Plus, Mail, Paperclip, Upload, Sparkles, Clock, ChevronRight, X, Send, Archive, CheckCircle2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ArchiveConfirmDialog from "./ArchiveConfirmDialog";
import { getStakeholderById, avatarColors } from "@/data/dealData";
import { getPrimitivesForRole } from "@/lib/value-primitives/roleDefaults";
import { getPrimitiveById } from "@/lib/value-primitives/types";

const getAvatarColor = (id: number) => avatarColors[id % avatarColors.length];

interface Attachment {
  name: string;
  type: string;
  file?: File;
}

export interface CrossSellData {
  offeringName: string;
  alignmentPct: number;
  signals: { source: string; stakeholder: string; quote: string }[];
  buyerNeed: string;
  capabilityMatch: string;
  costOfInaction: string;
}

interface ActionEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: {
    id: number;
    stakeholderIds?: number[];
    stakeholderName: string;
    stakeholderRole: string;
    artifact: string;
    title?: string;
    basedOn: string;
    deadline?: string;
    priority: "high" | "medium" | "low";
  } | null;
  company?: string;
  companyLogo?: string;
  onNextAction?: () => void;
  hasNextAction?: boolean;
  onArchive?: () => void;
  onMarkDone?: () => void;
  crossSellData?: CrossSellData | null;
}

const ActionEmailDialog = ({
  open,
  onOpenChange,
  action,
  company,
  companyLogo,
  onNextAction,
  hasNextAction = false,
  onArchive,
  onMarkDone,
  crossSellData,
}: ActionEmailDialogProps) => {
  // Return null early if no action
  if (!action) return null;
  
  const isCrossSell = !!crossSellData;
  
  const [toEmail, setToEmail] = useState(`${action.stakeholderName.toLowerCase().replace(" ", ".")}@${(company || "company").toLowerCase()}.com`);
  const [ccEmail, setCcEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState(`Aligning on ROI & Budget — Quick Working Session with You + CFO`);
  const [emailBody, setEmailBody] = useState(
    `Hi ${action.stakeholderName.split(" ")[0]},\n\nThank you for the candid feedback on pricing during our last conversation. I understand the concerns about budget alignment and wanted to follow up with a clear path forward.\n\nTo ensure we're inside your budget cap and that the investment case is bulletproof, I'd like to schedule a focused ROI review session with you and your finance team. During this session, we'll:\n\n• Walk through the detailed ROI forecast with your specific metrics\n• Validate our assumptions against your actual operational data\n• Tie projected outcomes directly to your strategic KPIs\n• Explore right-sized deployment options (e.g., phased rollout, pilot program)\n• Discuss flexible payment structures that align with your budget cycles\n\nOur goal is to make the value story and spend both work for you—no compromises on outcomes.\n\nI'm confident we can find an approach that delivers the results you need while respecting your budget constraints. Would you be available for a 30-minute call this week to explore these options together?\n\nLooking forward to connecting and finding the right solution for your team.\n\nBest regards`
  );
  const [attachments, setAttachments] = useState<Attachment[]>([
    { name: "Problem Statement Brief", type: "PDF" },
    { name: "Value Summary", type: "DOCX" },
  ]);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [emailOpened, setEmailOpened] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red text-white";
      case "medium":
        return "bg-yellow text-black";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDeadlineText = () => action.deadline || "To schedule";

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments: Attachment[] = Array.from(files).map(file => ({
        name: file.name.replace(/\.[^/.]+$/, ""),
        type: file.name.split('.').pop()?.toUpperCase() || "FILE",
        file: file
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenEmail = () => {
    const mailtoLink = `mailto:${encodeURIComponent(toEmail)}${ccEmail ? `?cc=${encodeURIComponent(ccEmail)}` : '?'}${ccEmail ? '&' : ''}subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink, '_blank');
    setEmailOpened(true);
  };

  const handleConfirmDone = () => {
    if (onMarkDone) {
      onMarkDone();
      onOpenChange(false);
    }
  };

  const handleArchiveConfirm = () => {
    setArchiveDialogOpen(false);
    if (onArchive) {
      onArchive();
    }
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="ref-action-dialog w-[80vw] max-w-none max-h-[90vh] overflow-y-auto p-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Top Bar - Compact */}
          <div className="ref-action-topbar flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-purple" />
                <span className="font-semibold text-sm text-foreground">Email</span>
              </div>
              {isCrossSell && (
                <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 uppercase text-xxs font-semibold" variant="outline">
                  Cross-sell opportunity
                </Badge>
              )}
              <Badge data-priority={action.priority} className={`${getPriorityColor(action.priority)} uppercase text-xxs font-semibold`}>
                {action.priority}
              </Badge>
              {(getPrimitivesForRole(action.stakeholderRole).slice(0,2).map(p=>p.primitiveId)).map(id=><span className="ref-goal-pill" key={id}>{getPrimitiveById(id)?.shortLabel}</span>)}

            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-foreground">Deadline: {getDeadlineText()}</span>
            </div>
          </div>

          <div className="ref-action-heading">
            <DialogTitle>{action.title || action.artifact}</DialogTitle>
            <div className="ref-action-attachments" aria-label="Attachments">
              {attachments.map((attachment,index)=><span className="ref-attachment" key={`${attachment.name}-${index}`} title={`${attachment.name} (${attachment.type})`}><Paperclip size={13}/><span>{attachment.name}</span><button aria-label={`Remove ${attachment.name}`} onClick={()=>handleRemoveAttachment(index)}><X size={12}/></button></span>)}
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload}/>
              <button className="ref-attach-button" onClick={()=>fileInputRef.current?.click()}><Plus size={13}/> Attach</button>
            </div>
          </div>
          {/* Editor content */}
          <div className="ref-action-body">
            {/* Left Column - Context */}
            <div className="ref-action-people">
              {/* Stakeholder Info - Compact */}
              {(() => {
                const stakeholderIds = action.stakeholderIds || [];
                const allStakeholders = stakeholderIds.map(id => getStakeholderById(id)).filter(Boolean);

                if (allStakeholders.length === 0) {
                  return (
                    <div className="flex items-center gap-2.5 p-2.5 bg-muted/30 rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {action.stakeholderName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{action.stakeholderName}</p>
                        <p className="text-xs text-muted-foreground truncate">{action.stakeholderRole}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-wrap gap-2">
                    {allStakeholders.map((sh) => sh && (
                      <div key={sh.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                        <Avatar className="w-8 h-8 ring-2 ring-purple/20">
                          <AvatarImage src={sh.avatar} />
                          <AvatarFallback className={`${getAvatarColor(sh.id)} text-xs font-medium`}>
                            {sh.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{sh.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{sh.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

            </div>

            {/* Right Column - Editable Content */}
            <div className="ref-action-fields space-y-3">
              {/* Subject Field */}
              <div>
                <label className="text-xxs font-medium text-muted-foreground uppercase tracking-wide">Subject</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>

              {/* Body Field */}
              <div>
                <label className="text-xxs font-medium text-muted-foreground uppercase tracking-wide">Body</label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="mt-1 min-h-[180px] resize-none text-sm"
                />
              </div>

              {/* To/CC Fields */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-muted-foreground w-7">To:</label>
                  <Input
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    className="flex-1 h-9"
                    placeholder="recipient@company.com"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-muted-foreground w-7">CC:</label>
                  <Input
                    value={ccEmail}
                    onChange={(e) => setCcEmail(e.target.value)}
                    className="flex-1 h-9"
                    placeholder="cc@company.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Compact */}
          <div className="ref-action-footer border-t border-border flex items-center justify-between">
            <Button 
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setArchiveDialogOpen(true)}
            >
              <Archive className="w-4 h-4" />
              Archive
            </Button>
            <div className="flex items-center gap-2">
              {isCrossSell ? (
                <>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={handleOpenEmail}
                  >
                    Preview & Edit
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-red hover:bg-red/90 text-white gap-1.5"
                    onClick={handleOpenEmail}
                  >
                    <Send className="w-4 h-4" />
                    Send Now
                  </Button>
                  <button 
                    className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                    onClick={() => {}}
                  >
                    Schedule
                  </button>
                </>
              ) : (
                <>
                  {!emailOpened ? (
                    <Button 
                      size="sm"
                      className="bg-purple hover:bg-gradient-to-r hover:from-purple hover:to-violet-500 text-white gap-1.5"
                      onClick={handleOpenEmail}
                    >
                      <Send className="w-4 h-4" />
                      Open Email
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      className="bg-green hover:bg-green/90 text-white gap-1.5"
                      onClick={handleConfirmDone}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Done
                    </Button>
                  )}
                  {hasNextAction && (
                    <Button
                      size="sm"
                      className="bg-purple hover:bg-gradient-to-r hover:from-purple hover:to-violet-500 text-white gap-1"
                      onClick={onNextAction}
                    >
                      Next Action
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ArchiveConfirmDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        onConfirm={handleArchiveConfirm}
        actionTitle={action.artifact}
      />
    </>
  );
};

export default ActionEmailDialog;
