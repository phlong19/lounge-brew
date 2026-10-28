/** Complete homepage inventory, grouped for browsing without a second slider. */
export const foodGroups = [
  { id: "drinks", label: "foodDrinks", productIds: ["60543187", "53962041", "80392651", "43580127"] },
  { id: "meals", label: "foodMeals", productIds: ["76819432", "57286190", "9735684", "64815027", "53681249", "41098632", "38017265"] },
  { id: "sharing", label: "foodSharing", productIds: ["1963487", "41967028", "73041682", "57024961", "1385247", "39584127", "91732064", "10724936", "74062815", "26087519"] },
] as const;

export type FoodGroup = typeof foodGroups[number]["id"];
