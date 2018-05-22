import { get } from "lodash";
import { parseResolveInfo } from "graphql-parse-resolve-info";

const toLower = x => (x || "").toLowerCase();

export const onlyAdminMutations = {
  Mutation: (resolve, parent, args, context, info) => {
    const { name } = parseResolveInfo(info);
    const roles = get(context, "jwt.context.user.roles", []);
    if (name !== "saveSet" && !roles.map(toLower).includes("admin")) {
      throw new Error("Unauthorized - Administrator role is required");
    }
    return resolve(parent, args, context, info);
  }
};
