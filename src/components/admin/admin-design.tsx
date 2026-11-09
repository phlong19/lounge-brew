"use client";
import {
  AdminVideo,
  type VideoFormState,
} from "@/components/admin/admin-video";

import { TableSkeleton } from "@/components/ui/loading-state";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/lib/admin/query";
import { AdminReservations } from "@/components/admin/admin-reservations";
import { AdminStaff } from "@/components/admin/admin-staff";
import { AdminSeating } from "@/components/admin/admin-seating";
import type { StaffInfo } from "@/components/admin/staff-menu";
import {
  adminRequest,
  loadAdminEvents,
  saveAdminEvent,
} from "@/lib/admin/client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Inline, Stack } from "@/components/ui/layout";
import { Typography } from "@/components/ui/typography";
import type { EventRow } from "@/types/domain";
import { DeleteEventDialog } from "@/components/admin/delete-event-dialog";
import { AdminEvents } from "@/components/admin/admin-events";
import { AdminEventDrawer } from "@/components/admin/admin-event-drawer";
import type { EditableEvent } from "@/lib/admin/event-list";
import { AlertMessage } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { adminStyles as s } from "@/lib/ui/admin-styles";

export function AdminDesign({
  events,
  staff,
  initialSection = "events",
}: {
  events: EventRow[];
  staff?: StaffInfo;
  initialSection?: "events" | "video" | "seating" | "staff" | "reservations";
}) {
  const t = useTranslations("AdminDesign");
  const client = useQueryClient();
  const toast = useToast();
  const [error, setError] = useState("");
  const tab = initialSection;
  const [videoState, setVideoState] = useState<VideoFormState>({
    dirty: false,
    busy: false,
    valid: false,
  });
  const dirty = tab === "video" && videoState.dirty;
  const drawerTrigger = useRef<HTMLButtonElement | null>(null);
  const [deleting, setDeleting] = useState<EditableEvent | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [editing, setEditing] = useState<EditableEvent | null>(null);
  const eventQuery = useQuery({
    queryKey: adminKeys.events,
    queryFn: ({ signal }) => loadAdminEvents(signal),
    enabled: tab === "events",
    initialData: events.length
      ? events.map((event) => ({ ...event }))
      : undefined,
  });
  const items = eventQuery.data ?? [];
  const loading = eventQuery.isPending;
  const loadError = eventQuery.error?.message ?? "";
  const saveMutation = useMutation({
    mutationFn: (event: EditableEvent) =>
      saveAdminEvent(event, !items.some((item) => item.id === event.id)),
    onSuccess: async (saved) => {
      client.setQueryData<EditableEvent[]>(adminKeys.events, (rows) =>
        rows?.some((item) => item.id === saved.id)
          ? rows.map((item) => (item.id === saved.id ? saved : item))
          : [...(rows ?? []), saved],
      );
      setEditing(null);
      toast("Đã lưu sự kiện.");
      await client.invalidateQueries({ queryKey: adminKeys.events });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      adminRequest("/api/admin/events/" + id, { method: "DELETE" }),
    onSuccess: async (_result, id) => {
      client.setQueryData<EditableEvent[]>(adminKeys.events, (rows) =>
        (rows ?? []).filter((item) => item.id !== id),
      );
      setEditing(null);
      setDeleting(null);
      toast("Đã xóa sự kiện.");
      await client.invalidateQueries({ queryKey: adminKeys.events });
    },
  });
  const busy = saveMutation.isPending || deleteMutation.isPending;
  async function persistEvent(event: EditableEvent) {
    if (busy) return;
    setError("");
    try {
      await saveMutation.mutateAsync(event);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không thể lưu sự kiện.",
      );
    }
  }
  async function removeEvent() {
    if (!deleting || busy) return;
    setDeleteError("");
    try {
      await deleteMutation.mutateAsync(deleting.id);
    } catch (cause) {
      setDeleteError(
        cause instanceof Error ? cause.message : "Không thể xóa sự kiện.",
      );
    }
  }
  const addEvent = (trigger: HTMLButtonElement) => {
    drawerTrigger.current = trigger;
    setError("");
    setEditing({
      id: crypto.randomUUID(),
      title_vi: "",
      title_en: "",
      performer_name: "",
      event_date: "",
      end_date: null,
      cover_image_url: null,
      is_active: true,
      additionalFee: 0,
    });
  };
  return (
    <Stack gap="lg" data-admin-page={tab}>
      <Inline className="items-start justify-between">
        <Stack gap="xs">
          <Typography
            as="h1"
            variant="heading"
            className="text-2xl md:text-2xl"
          >
            {tab === "reservations"
              ? "Đặt bàn"
              : tab === "staff"
                ? "Nhân viên"
                : tab === "seating"
                  ? "Sơ đồ chỗ ngồi"
                  : t(tab === "events" ? "eventsTitle" : "videoTitle")}
          </Typography>
        </Stack>
        {tab === "events" ? (
          <Button onClick={(event) => addEvent(event.currentTarget)}>
            <Icon name="plus" />
            Thêm sự kiện
          </Button>
        ) : tab === "video" ? (
          <Button
            className={s.primary}
            type="submit"
            form="video-settings"
            disabled={!dirty || !videoState.valid || videoState.busy}
          >
            <Icon name="check" />
            {videoState.busy ? "Đang lưu…" : "Lưu"}
          </Button>
        ) : null}
      </Inline>
      {dirty ? (
        <AlertMessage variant="warning">{t("unsaved")}</AlertMessage>
      ) : null}
      {tab === "reservations" ? (
        <AdminReservations />
      ) : tab === "staff" ? (
        <AdminStaff />
      ) : tab === "seating" ? (
        <AdminSeating />
      ) : tab === "events" ? (
        loading ? (
          <TableSkeleton
            columns={["Chương trình", "Ngày diễn", "Phụ thu", "Hiển thị", ""]}
            label="Đang tải sự kiện…"
          />
        ) : loadError ? (
          <Stack>
            <AlertMessage variant="destructive">{loadError}</AlertMessage>
            <Button
              variant="outline"
              className="w-fit"
              onClick={() => void eventQuery.refetch()}
            >
              Thử lại
            </Button>
          </Stack>
        ) : (
          <AdminEvents
            items={items}
            onEdit={(event, trigger) => {
              drawerTrigger.current = trigger;
              setError("");
              setEditing(event);
            }}
          />
        )
      ) : (
        <AdminVideo
          onState={setVideoState}
          onSaved={() => toast("Đã lưu video.")}
        />
      )}
      <DeleteEventDialog
        name={deleting?.title_vi ?? null}
        busy={busy}
        error={deleteError}
        onClose={() => setDeleting(null)}
        onConfirm={() => void removeEvent()}
      />
      <AdminEventDrawer
        onDelete={(event) => {
          setDeleteError("");
          setDeleting(event);
        }}
        saving={busy}
        error={error}
        onReturnFocus={() => {
          if (drawerTrigger.current?.isConnected)
            drawerTrigger.current.focus({ preventScroll: true });
          else document.getElementById("event-search")?.focus();
        }}
        event={editing}
        isNew={!items.some((item) => item.id === editing?.id)}
        onClose={() => {
          if (!busy) {
            setEditing(null);
            setError("");
          }
        }}
        onApply={persistEvent}
      />
    </Stack>
  );
}
