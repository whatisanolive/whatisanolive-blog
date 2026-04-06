"use client";

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "../ui/button"
import { Menu,BarChart, LayoutDashboard, Settings, MessageCircle,FileText  } from "lucide-react"
import Link from "next/link";
import { useState } from "react";

const LeftSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button className="md:hidden m-4" variant={'outline'}>
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>

                <SheetContent side={"left"} className="w-[250px]">
                    <SheetHeader>
                        <SheetTitle></SheetTitle>
                    </SheetHeader>
                    <DashboardSidebar />
                </SheetContent>
            </Sheet>

            <div className="hidden md:block h-screen w-[250px] border-r bg-background" >
                <DashboardSidebar/>
            </div>
        </div>
    )
}

export default LeftSidebar;

const DashboardSidebar = () => {
    return (
        <div className="h-full px-4 py-6">

            <nav>
                <Link href="/admin">
                    <Button variant={"ghost"} className="w-full justify-start">
                        <LayoutDashboard className="h-5 w-5" />
                        Overview
                    </Button>
                </Link>


                <Link href="/dashbard">
                    <Button variant={"ghost"} className="w-full justify-start">
                        <FileText className="h-5 w-5" />
                        Posts
                    </Button>
                </Link>


                <Link href="/dashbard">
                    <Button variant={"ghost"} className="w-full justify-start">
                        <MessageCircle className="h-5 w-5" />
                        Comments
                    </Button>
                </Link>


                <Link href="/dashbard">
                    <Button variant={"ghost"} className="w-full justify-start">
                        <BarChart className="h-5 w-5" />
                        Analytics
                    </Button>
                </Link>


                <Link href="/dashbard">
                    <Button variant={"ghost"} className="w-full justify-start">
                        <Settings className="h-5 w-5" />
                        Settings
                    </Button>
                </Link>


            </nav>
        </div>
    )
}