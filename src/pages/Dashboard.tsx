import { useAuth } from '@/contexts/FirebaseAuthContext';
import { motion } from 'framer-motion';
import { useUserSpace } from '@/hooks/useUserSpace';

export default function Dashboard() {
  const { user } = useAuth();
  const currentSpace = useUserSpace();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenue, <span className="gradient-text">{user?.displayName || 'Utilisateur'}</span>
        </h1>
        <p className="text-muted-foreground flex items-center gap-2">
          {currentSpace.title}
        </p>
      </div>

      {currentSpace.component}
    </motion.div>
  );
}
