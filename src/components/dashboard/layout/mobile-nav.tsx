"use client";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RouterLink from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Logo } from "@/components/core/logo";
import { isNavItemActive } from "@/lib/is-nav-item-active";
import { paths } from "@/paths";
import type { NavItemConfig } from "@/types/nav";

import { navItems } from "./config";
import { navIcons } from "./nav-icons";

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
  items?: NavItemConfig[];
}

export function MobileNav({
  open,
  onClose,
}: MobileNavProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <Drawer
      PaperProps={{
        sx: {
          "--MobileNav-background": "var(--mui-palette-neutral-950)",
          "--MobileNav-color": "var(--mui-palette-common-white)",
          "--NavItem-color": "var(--mui-palette-neutral-300)",
          "--NavItem-hover-background": "rgba(255, 255, 255, 0.04)",
          "--NavItem-active-background": "var(--mui-palette-primary-main)",
          "--NavItem-active-color": "var(--mui-palette-primary-contrastText)",
          "--NavItem-disabled-color": "var(--mui-palette-neutral-500)",
          "--NavItem-icon-color": "var(--mui-palette-neutral-400)",
          "--NavItem-icon-active-color":
            "var(--mui-palette-primary-contrastText)",
          "--NavItem-icon-disabled-color": "var(--mui-palette-neutral-600)",
          bgcolor: "var(--MobileNav-background)",
          color: "var(--MobileNav-color)",
          display: "flex",
          flexDirection: "column",
          maxWidth: "100%",
          scrollbarWidth: "none",
          width: "var(--MobileNav-width)",
          zIndex: "var(--MobileNav-zIndex)",
          "&::-webkit-scrollbar": { display: "none" },
        },
      }}
      onClose={onClose}
      open={open}
    >
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box
          component={RouterLink}
          href={paths.home}
          sx={{ display: "inline-flex" }}
        >
          <Logo color="light" height={72} width={128} />
        </Box>
      </Stack>
      <Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />
      <Box component="nav" sx={{ flex: "1 1 auto", p: "12px" }}>
        {renderNavItems({ pathname, onClose, items: navItems })}
      </Box>
    </Drawer>
  );
}

function renderNavItems({
  items = [],
  pathname,
  onClose,
}: {
  items?: NavItemConfig[];
  pathname: string;
  onClose: (() => void) | undefined;
}): React.JSX.Element {
  const children = items.map((item) => (
    <NavItem {...item} key={item.key} pathname={pathname} onClick={onClose} />
  ));

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends NavItemConfig {
  pathname: string;
  onClick: (() => void) | undefined;
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
  items,
  onClick,
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({
    disabled,
    external,
    href,
    matcher,
    pathname,
  });
  const Icon = icon ? navIcons[icon] : null;

  // Estado para colapsar/expandir itens
  // const [isExpanded, setIsExpanded] = React.useState(false);

  const handleToggle = () => {
    if (items && items.length > 0) {
      // setIsExpanded((prev) => !prev);
    } else if (onClick) {
      onClick();
    }
    // if (onClick) {
    //   onClick();
    // }
  };

  return (
    <li>
      <Box
        onClick={handleToggle}
        {...(href
          ? {
              component: external ? "a" : RouterLink,
              href,
              target: external ? "_blank" : undefined,
              rel: external ? "noreferrer" : undefined,
            }
          : { role: "button" })}
        sx={{
          alignItems: "center",
          borderRadius: 1,
          color: "var(--NavItem-color)",
          cursor: "pointer",
          display: "flex",
          flex: "0 0 auto",
          gap: 1,
          p: "6px 16px",
          position: "relative",
          textDecoration: "none",
          whiteSpace: "nowrap",
          ...(disabled && {
            bgcolor: "var(--NavItem-disabled-background)",
            color: "var(--NavItem-disabled-color)",
            cursor: "not-allowed",
          }),
          ...(active && {
            bgcolor: "var(--NavItem-active-background)",
            color: "var(--NavItem-active-color)",
          }),
        }}
      >
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          {Icon && (
            <Icon
              fill={
                active
                  ? "var(--NavItem-icon-active-color)"
                  : "var(--NavItem-icon-color)"
              }
              fontSize="var(--icon-fontSize-md)"
              weight={active ? "fill" : undefined}
            />
          )}
        </Box>
        <Box sx={{ flex: "1 1 auto" }}>
          {items && items.length > 0 ? (
            <Stack alignItems={"center"} direction={"row"} spacing={1}>
              <Typography
                component="span"
                sx={{
                  color: "inherit",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  lineHeight: "28px",
                  ml: 0,
                  pl: 0,
                }}
              >
                {title}
              </Typography>
              {/* {isExpanded ? <CaretUp /> : <CaretDown />} */}
            </Stack>
          ) : (
            <>
              <Typography
                component="span"
                sx={{
                  color: "inherit",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  lineHeight: "28px",
                }}
              >
                {title}
              </Typography>
            </>
          )}
        </Box>
      </Box>
      {items && items.length > 0 && (
        <Stack component="ul" spacing={1} sx={{ listStyle: "none", pl: 2 }}>
          {items.map((child) => (
            <NavItem
              {...child}
              key={child.key}
              onClick={onClick}
              pathname={pathname}
            />
          ))}
        </Stack>
      )}
    </li>
  );
}
