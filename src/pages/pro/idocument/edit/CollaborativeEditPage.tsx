/**
 * Collaborative Document Editor Page
 * Route: /pro/idocument/edit/:id
 */

import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/FirebaseAuthContext";
import { CollaborativeEditor } from "@/components/editor";
import { useToast } from "@/components/ui/use-toast";

export default function CollaborativeEditPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();
    const { toast } = useToast();

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                        Veuillez vous connecter pour accéder à ce document.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-primary text-white px-4 py-2 rounded-lg"
                    >
                        Se connecter
                    </button>
                </div>
            </div>
        );
    }

    if (!id) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Document non trouvé.</p>
                    <button
                        onClick={() => navigate("/pro/idocument")}
                        className="text-primary underline mt-2"
                    >
                        Retour à iDocument
                    </button>
                </div>
            </div>
        );
    }

    const handleArchive = () => {
        toast({
            title: "📦 Document archivé",
            description: "Le document a été transféré vers iArchive avec succès.",
        });
        // Optional: navigate away after archive
        // navigate("/pro/idocument");
    };

    return (
        <div className="h-full p-4">
            <CollaborativeEditor documentId={id} onArchive={handleArchive} />
        </div>
    );
}
