import { assert, clearStore, test } from "matchstick-as/assembly";
import { ERC1155, Marketplace, User } from "./utils";

const treasure = new ERC1155();

const me = new User();
const you = new User();
const friend = new User();

const mp = new Marketplace(me, you, treasure);

test("listings are calculated correctly", () => {
  treasure.mint(0, 3, me.id);
  treasure.mint(1, 1, me.id);

  assert.fieldEquals("Collection", treasure.id, "totalListings", "0");

  mp.list(1);

  assert.fieldEquals("Collection", treasure.id, "totalListings", "1");
  assert.fieldEquals("Listing", `${me.id}-${treasure.id}-0x1`, "quantity", "1");

  mp.list(0, 3);

  assert.fieldEquals("Collection", treasure.id, "totalListings", "4");
  assert.fieldEquals("Listing", `${me.id}-${treasure.id}-0x0`, "quantity", "3");
  assert.fieldEquals("Listing", `${me.id}-${treasure.id}-0x1`, "quantity", "1");

  mp.cancel(1);

  assert.fieldEquals("Collection", treasure.id, "totalListings", "3");
  assert.fieldEquals("Listing", `${me.id}-${treasure.id}-0x0`, "quantity", "3");
  assert.notInStore("Listing", `${me.id}-${treasure.id}-0x1`);

  mp.buy(0);

  assert.fieldEquals("Collection", treasure.id, "totalListings", "2");
  assert.fieldEquals("Listing", `${me.id}-${treasure.id}-0x0`, "quantity", "2");

  clearStore();
});

test("items are calculated correctly", () => {
  treasure.mint(0, 2, me.id);
  treasure.mint(1, 1, me.id);

  assert.fieldEquals("Collection", treasure.id, "totalItems", "3");
  assert.fieldEquals("Token", `${treasure.id}-0x0`, "totalItems", "2");
  assert.fieldEquals("Token", `${treasure.id}-0x1`, "totalItems", "1");

  treasure.mint(2, 1, you.id);

  assert.fieldEquals("Collection", treasure.id, "totalItems", "4");
  assert.fieldEquals("Token", `${treasure.id}-0x0`, "totalItems", "2");
  assert.fieldEquals("Token", `${treasure.id}-0x1`, "totalItems", "1");
  assert.fieldEquals("Token", `${treasure.id}-0x2`, "totalItems", "1");

  // Only send 1 of the 2
  treasure.transfer(0, me.id, friend.id, 1);

  assert.fieldEquals("Collection", treasure.id, "totalItems", "4");
  assert.fieldEquals("Token", `${treasure.id}-0x0`, "totalItems", "2");
  assert.fieldEquals("Token", `${treasure.id}-0x1`, "totalItems", "1");
  assert.fieldEquals("Token", `${treasure.id}-0x2`, "totalItems", "1");

  clearStore();
});

test("owners is calculated correctly with transfers", () => {
  treasure.mint(0, 2, me.id);
  treasure.mint(1, 1, me.id);

  assert.fieldEquals("Collection", treasure.id, "totalOwners", "1");
  assert.fieldEquals("Token", `${treasure.id}-0x0`, "totalOwners", "1");
  assert.fieldEquals("Token", `${treasure.id}-0x1`, "totalOwners", "1");

  treasure.mint(2, 1, you.id);

  assert.fieldEquals("Collection", treasure.id, "totalOwners", "2");
  assert.fieldEquals("Token", `${treasure.id}-0x0`, "totalOwners", "1");
  assert.fieldEquals("Token", `${treasure.id}-0x1`, "totalOwners", "1");
  assert.fieldEquals("Token", `${treasure.id}-0x2`, "totalOwners", "1");

  // Only send 1 of the 2
  treasure.transfer(0, me.id, friend.id, 1);

  assert.fieldEquals("Collection", treasure.id, "totalOwners", "3");
  assert.fieldEquals("Token", `${treasure.id}-0x0`, "totalOwners", "2");
  assert.fieldEquals("Token", `${treasure.id}-0x1`, "totalOwners", "1");
  assert.fieldEquals("Token", `${treasure.id}-0x2`, "totalOwners", "1");

  // Now send the last one from me to you
  treasure.transfer(0, me.id, you.id, 1);

  assert.fieldEquals("Collection", treasure.id, "totalOwners", "3");
  assert.fieldEquals("Token", `${treasure.id}-0x0`, "totalOwners", "2");
  assert.fieldEquals("Token", `${treasure.id}-0x1`, "totalOwners", "1");
  assert.fieldEquals("Token", `${treasure.id}-0x2`, "totalOwners", "1");

  // Now send token 1 away from me to friend.
  treasure.transfer(1, me.id, friend.id, 1);

  assert.fieldEquals("Collection", treasure.id, "totalOwners", "2");
  assert.fieldEquals("Token", `${treasure.id}-0x0`, "totalOwners", "2");
  assert.fieldEquals("Token", `${treasure.id}-0x1`, "totalOwners", "1");
  assert.fieldEquals("Token", `${treasure.id}-0x2`, "totalOwners", "1");

  treasure.transfer(0, you.id, friend.id, 1);

  assert.fieldEquals("Collection", treasure.id, "totalOwners", "2");
  assert.fieldEquals("Token", `${treasure.id}-0x0`, "totalOwners", "1");
  assert.fieldEquals("Token", `${treasure.id}-0x1`, "totalOwners", "1");
  assert.fieldEquals("Token", `${treasure.id}-0x2`, "totalOwners", "1");

  clearStore();
});

test("owners is calculated correctly with marketplace buy", () => {
  treasure.mint(0, 2, me.id);

  assert.fieldEquals("Collection", treasure.id, "totalOwners", "1");
  assert.fieldEquals("Token", `${treasure.id}-0x0`, "totalOwners", "1");

  mp.list(0, 2);
  mp.buy(0, 1);

  assert.fieldEquals("Collection", treasure.id, "totalOwners", "2");
  assert.fieldEquals("Token", `${treasure.id}-0x0`, "totalOwners", "2");

  mp.buy(0, 1);

  assert.fieldEquals("Collection", treasure.id, "totalOwners", "1");
  assert.fieldEquals("Token", `${treasure.id}-0x0`, "totalOwners", "1");

  clearStore();
});