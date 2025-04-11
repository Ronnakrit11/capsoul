import { type SchemaTypeDefinition } from "sanity";
import { categoryType } from "./categoryType";
import { productType } from "./productType";
import { orderType } from "./orderTypes";
import { bannerType } from "./bannerType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [categoryType, productType, orderType, bannerType],
};