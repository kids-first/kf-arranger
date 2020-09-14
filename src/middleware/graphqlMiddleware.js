import { get, toLower } from 'lodash';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

export const onlyAdminMutations = {
  Mutation: (resolve, parent, args, context, info) => {
    const { name: mutationName } = parseResolveInfo(info);
    const roles = get(context, 'jwt.context.user.roles', []);

    const authorizedMutations = ['saveSet', 'deleteSets', 'updateSet'];
    const hasAdminRole = roles.map(toLower).includes('admin');

    const adminRoleNeededForMutation = !hasAdminRole && !authorizedMutations.includes(mutationName);
    if (adminRoleNeededForMutation) {
      throw new Error('Unauthorized - Administrator role is required');
    }
    return resolve(parent, args, context, info);
  },
};
