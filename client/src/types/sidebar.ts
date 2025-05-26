import { ConversationTypes } from "./chat";

export type ConversationEditWidgetProps = {
  editTitle: string;
  setEditTitle: (title: string) => void;
  handleCancelEdit: () => void;
  handleSaveEdit: () => void;
};

export type ConversationMenuItemProps = {
  conversation: ConversationTypes;
  openDropdownId: string | null;
  handleMoreOptionsClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => void;
  handleEdit: (id: string, title: string) => void;
  handleDeleteClick: (id: string) => void;
  handleDropdownOpenChange: (open: boolean, conversationId: string) => void;
};
