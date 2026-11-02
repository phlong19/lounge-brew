"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { AppLink } from "@/components/ui/link";
import { venue } from "@/data/trixie-content";

export function HotlineMenu({ label }: { label: string }) {
  return <DropdownMenu>
    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={label}><Icon name="phone" className="size-4" /></Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" aria-label={label}>
      {[{ href: venue.phoneHref, number: venue.phone }, { href: venue.secondaryPhoneHref, number: venue.secondaryPhone }].map(phone => <DropdownMenuItem key={phone.href} asChild><AppLink href={phone.href}><Icon name="phone" className="size-4" />{phone.number}</AppLink></DropdownMenuItem>)}
    </DropdownMenuContent>
  </DropdownMenu>;
}
