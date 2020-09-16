# Access control

Access control for API calls in EQUIP is controlled per-call basis, to allow for access through groups. Eventually, we'd like to move towards a system that uses methods from the object as recommended by current meteor best practices. 

When contributing to the code, please follow all meteor best practices, including those mentioned on [meteor's developer guide](https://guide.meteor.com/security.html).

Access control is done through the use of the `checkAccess()` function in `helpers/access.js`. This is to allow the access (edit, view, etc.) by users to which that entity has been shared. The functin is called with the entity's `_id`, the type, and the access level required. The `view` level is used when copying/duplicating content, the `edit` level when modifying content, `delete` when deleting content, and `manage` and `admin` are used by groups.

As there is currently no versioning, `edit` access has the potential to be as destructive as `delete`, so giving this permission should be used carefully. 

If the user owns the entity, the access level is ignored and the user is allowed to do anything. If the access check fails, a `Meteor.error` is thrown with a descriptive message.

