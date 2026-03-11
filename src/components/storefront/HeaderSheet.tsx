import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet'
import { Menu, XIcon } from 'lucide-react'
import { CustomLink } from '../ui/link'
import Link from 'next/link'
import { Fragment } from 'react'

interface HeaderSheetProps {
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  side: 'left' | 'right'
  NAV_LINKS: { href: string; label: string }[]
}

export const HeaderSheet = ({ mobileOpen, setMobileOpen, side, NAV_LINKS }: HeaderSheetProps) => {
  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Abrir menu de navegacion"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-8" aria-hidden="true" strokeWidth={1.5} />
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className="w-10/12 pt-3 pl-2 border-none xl:hidden" showCloseButton={false}>
        <Button
          variant="ghost"
          size="icon"
          className=" pt-2"
          aria-label="Cerrar menu de navegacion"
          onClick={() => setMobileOpen(false)}
        >
          <XIcon
            className="size-8 text-foreground active:text-primary"
            aria-hidden="true"
            strokeWidth={1.5}
          />
        </Button>
        <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
        <nav className="flex flex-col gap-1" aria-label="Navegacion movil">
          {NAV_LINKS.map((link) => (
            <Fragment key={link.href}>
              <CustomLink variant="navMobile" size="xl" asChild>
                <Link href={link.href} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              </CustomLink>
              <hr className="my-2 mx-2 mr-6" />
            </Fragment>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
