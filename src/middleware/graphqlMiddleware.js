import { get, toLower } from 'lodash';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

const setMutationNames = ['saveSet', 'deleteSets', 'updateSet'];

export const onlyAdminMutations = {
  Mutation: (resolve, parent, args, context, info) => {
    const { name: mutationName } = parseResolveInfo(info);
    const roles = get(context, 'jwt.context.user.roles', []);

    const hasAdminRole = roles.map(toLower).includes('admin');

    const adminRoleNeededForMutation = !hasAdminRole && !setMutationNames.includes(mutationName);
    if (adminRoleNeededForMutation) {
      throw new Error('Unauthorized - Administrator role is required');
    }
    return resolve(parent, args, context, info);
  },
};

export const setMutations = {
  Mutation: (resolve, parent, args, context, info) => {
    const { name: mutationName } = parseResolveInfo(info);
    if (!setMutationNames.includes(mutationName)) {
      return resolve(parent, args, context, info);
    }

    const userIdFromToken = get(context, 'jwt.sub', null);
    const enhancedArgs = { ...args, userId: userIdFromToken };
    return resolve(parent, enhancedArgs, context, info);
  },
};
