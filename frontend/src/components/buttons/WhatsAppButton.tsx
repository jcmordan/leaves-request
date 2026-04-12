"use client";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  phoneNumber: string;
  message?: string;
  children?: React.ReactNode;
};

const WhatsAppButton = ({ phoneNumber, message }: Props) => {
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, "")}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

  return (
    <Button
      variant="link"
      size="sm"
      onClick={() => window.open(whatsappUrl, "_blank")}
    >
      <MessageCircle className="h-4 w-4" />
    </Button>
  );
};

export default WhatsAppButton;
