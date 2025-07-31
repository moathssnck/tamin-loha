"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db, NotificationDocument } from "@/lib/firestore"
import { NotificationList } from "@/components/notifications-sidebar"
import { NotificationDetail } from "@/components/notification-detail"
import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  CheckCircle,
  Clock,
  XCircle,
  User,
  MoreHorizontal,
  Eye,
  Trash2,
  Download,
  Filter,
  Search,
  Users,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDocument[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationDocument[]>([])
  const [selectedNotification, setSelectedNotification] = useState<NotificationDocument | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, "pays"), orderBy("createdDate", "desc"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsData = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as NotificationDocument)
        .filter((notification) => !notification.isHidden)

      setNotifications(notificationsData)
      setFilteredNotifications(notificationsData)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    let filtered = notifications

    if (searchTerm.trim()) {
      filtered = filtered.filter((notification) =>
        notification.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.document_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.documment_owner_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.phone?.includes(searchTerm)
      )
    }

    if (activeFilter) {
      filtered = filtered.filter((notification) => notification.status === activeFilter)
    }

    setFilteredNotifications(filtered)
  }, [searchTerm, activeFilter, notifications])

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "pays", id), { status: "approved" })
      toast.success("تم قبول الإشعار بنجاح")
    } catch (error) {
      toast.error("حدث خطأ أثناء قبول الإشعار")
    }
  }

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, "pays", id), { status: "rejected" })
      toast.success("تم رفض الإشعار بنجاح")
    } catch (error) {
      toast.error("حدث خطأ أثناء رفض الإشعار")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "pays", id))
      toast.success("تم حذف الإشعار بنجاح")
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف الإشعار")
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status || status === "pending") {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">قيد المراجعة</Badge>
    } else if (status === "approved") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">تمت الموافقة</Badge>
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">تم الرفض</Badge>
    }
  }

  const getStatusIcon = (status?: string) => {
    if (!status || status === "pending") {
      return <Clock className="h-4 w-4 text-yellow-600" />
    } else if (status === "approved") {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const stats = {
    total: notifications.length,
    approved: notifications.filter(n => n.status === "approved").length,
    pending: notifications.filter(n => !n.status || n.status === "pending").length,
    rejected: notifications.filter(n => n.status === "rejected").length,
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الإشعارات</h1>
            <p className="text-sm text-gray-600 mt-1">مراقبة وإدارة الطلبات في الوقت الفعلي</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>متصل الآن</span>
            </div>
            <div className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="font-medium">137</span>
              <span className="text-sm">الإشعارات</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">تم الرفض</p>
                  <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                  <p className="text-xs text-red-600 mt-1">● تم الرفض</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">تمت الموافقة</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                  <p className="text-xs text-green-600 mt-1">● تمت الموافقة</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">قيد المراجعة</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-xs text-yellow-600 mt-1">● يتطلب مراجعة</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي الإشعارات</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-green-600 mt-1">● 12% من الشهر الماضي</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border-0 mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Download className="h-4 w-4 ml-2" />
                  تصدير
                </Button>
                <Button variant="outline" className="bg-gray-900 text-white border-gray-900 hover:bg-gray-800">
                  إجراءات متعددة
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث في الإشعارات..."
                    className="pr-10 w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      الأحدث أولاً
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>الأحدث أولاً</DropdownMenuItem>
                    <DropdownMenuItem>الأقدم أولاً</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      جميع الأنواع
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>جميع الأنواع</DropdownMenuItem>
                    <DropdownMenuItem>قيد المراجعة</DropdownMenuItem>
                    <DropdownMenuItem>تمت الموافقة</DropdownMenuItem>
                    <DropdownMenuItem>تم الرفض</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      جميع الحالات
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setActiveFilter(null)}>جميع الحالات</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveFilter("pending")}>قيد المراجعة</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveFilter("approved")}>تمت الموافقة</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveFilter("rejected")}>تم الرفض</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100">
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="text-right font-medium text-gray-700">المستخدم</TableHead>
                  <TableHead className="text-right font-medium text-gray-700">الحالة</TableHead>
                  <TableHead className="text-right font-medium text-gray-700">النوع</TableHead>
                  <TableHead className="text-right font-medium text-gray-700">التاريخ</TableHead>
                  <TableHead className="text-right font-medium text-gray-700">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {notification.documment_owner_full_name || 
                             notification.document_owner_full_name || 
                             notification.full_name || 
                             "غير محدد"}
                          </p>
                          <p className="text-sm text-gray-500">{notification.phone || "غير محدد"}</p>
                          <p className="text-xs text-green-600">● متصل</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(notification.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                          <AlertCircle className="h-3 w-3 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-700">عام</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        <p>منذ {format(new Date(notification.createdDate), "d", { locale: ar })} دقيقة</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(notification.createdDate), "yyyy/M/d", { locale: ar })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedNotification(notification)}>
                            <Eye className="h-4 w-4 ml-2" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleApprove(notification.id)}>
                            <CheckCircle className="h-4 w-4 ml-2" />
                            قبول
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReject(notification.id)}>
                            <XCircle className="h-4 w-4 ml-2" />
                            رفض
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(notification.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Detail Modal/Sidebar */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">تفاصيل الإشعار</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedNotification(null)}
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="p-6">
              <NotificationDetail
                notification={selectedNotification}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}