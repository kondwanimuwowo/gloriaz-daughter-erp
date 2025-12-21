import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ productName = null }) {
  const phoneNumber = "260976999510"; // Zambian format without +
  
  const getMessage = () => {
    if (productName) {
      return `Hi! I'm interested in the ${productName}. Can you tell me more?`;
    }
    return "Hi! I'd like to know more about your products.";
  };

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(getMessage())}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute right-full mr-3 bg-[#2C2C2C] text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat with us!
      </span>
    </a>
  );
}
