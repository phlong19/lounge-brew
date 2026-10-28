import { test } from "node:test";
import assert from "node:assert/strict";
import {
  menuStep,
  menuKeyDirection,
} from "../../src/components/lounge/use-menu-navigation.ts";

test("spread navigation advances beyond the visible right page and stops at covers", () => {
  assert.equal(menuStep(0, 18, true, 1), 1);
  assert.equal(menuStep(1, 18, true, 1), 3);
  assert.equal(menuStep(2, 18, true, 1), 3);
  assert.equal(menuStep(2, 18, true, -1), 0);
  assert.equal(menuStep(15, 18, true, 1), 17);
  assert.equal(menuStep(17, 18, true, 1), 17);
  assert.equal(menuStep(17, 18, true, -1), 15);
  assert.equal(menuStep(0, 18, true, -1), 0);
});
test("single page navigation always moves one page", () => {
  assert.equal(menuStep(2, 18, false, 1), 3);
  assert.equal(menuStep(2, 18, false, -1), 1);
});
test("viewer arrow navigation respects editable fields, controls, dialogs, and modifiers", () => {
  assert.equal(menuKeyDirection("ArrowRight", "DIV", null, false, false), 1);
  assert.equal(menuKeyDirection("ArrowLeft", "BUTTON", null, false, false), -1);
  for (const tag of ["INPUT", "SELECT", "TEXTAREA"])
    assert.equal(menuKeyDirection("ArrowRight", tag, null, false, false), 0);
  for (const role of ["dialog", "combobox", "listbox", "slider", "textbox"])
    assert.equal(menuKeyDirection("ArrowLeft", "DIV", role, false, false), 0);
  assert.equal(menuKeyDirection("ArrowRight", "DIV", null, true, false), 0);
  assert.equal(menuKeyDirection("ArrowRight", "DIV", null, false, true), 0);
});
