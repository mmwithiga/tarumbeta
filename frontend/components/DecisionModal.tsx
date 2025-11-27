import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ShoppingBag, UserCheck, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onFindInstructor: () => void;
  instrumentName: string;
}

export function DecisionModal({
  isOpen,
  onClose,
  onCheckout,
  onFindInstructor,
  instrumentName,
}: DecisionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 space-y-2">
          <DialogTitle className="text-3xl text-center">
            What would you like to do next?
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            You can proceed to checkout or find a music instructor to help you master this instrument.
          </DialogDescription>
        </DialogHeader>

        {/* Options */}
        <div className="p-6 pt-2">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Option A: Checkout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="group relative overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer h-full"
                onClick={onCheckout}
              >
                <div className="p-6 flex flex-col items-center text-center h-full">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4 group-hover:bg-primary/10 transition-colors">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Proceed to Checkout
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-6 flex-1">
                    Rent <span className="font-semibold text-foreground">{instrumentName}</span> now and start playing on your own.
                  </p>
                  
                  <Button
                    variant="outline"
                    className="w-full border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all"
                    onClick={onCheckout}
                  >
                    Go to Checkout
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Option B: Find Instructor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="group relative overflow-hidden border-2 border-secondary/50 hover:border-secondary transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer h-full bg-gradient-to-br from-secondary/5 to-accent/5"
                onClick={onFindInstructor}
              >
                {/* Recommended Badge */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    <Sparkles className="h-3 w-3" />
                    <span>Recommended</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col items-center text-center h-full">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary/80 mb-4 group-hover:shadow-lg transition-shadow animate-pulse-slow">
                    <UserCheck className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Find an Instructor
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-6 flex-1">
                    Match with a qualified instructor and learn faster with expert guidance.
                  </p>
                  
                  <Button
                    className="w-full gradient-teal text-white border-0 shadow-lg hover:shadow-xl transition-shadow"
                    onClick={onFindInstructor}
                  >
                    Find Instructor
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Trust Microcopy */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>
                Most users also choose an instructor — <span className="font-semibold text-foreground">boost your progress by 3×</span>
              </span>
            </p>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
