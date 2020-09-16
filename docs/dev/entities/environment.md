# Environments

Environments are called "Classrooms" on the front end. 

In general, all other data types depend on their environment for association, validation, and access control. `observation`, `sequence`, `subject`, `sequence_parameter`, and `subject_parameter` objects all have a base-level `envId` field referring to their `environemnt`. To get any given `environment`'s info 

For functions related to creating and manipulating environments, see the `/lib/collections/environments.js` file.

Access checks are only run for existing environment manipulation, not for creating new environments. See [Access control](../access.md) for more information.

Note: there is an api call for creating an example environment `environmentInsertExample`. It's not recommended to do this too often, as it has a higher than normal effect on database performance. This call, as well as `environmentDuplicate` and `environmentImportShared` also have the same performance impact. This is due to the (usually) hundreds of database calls needed to create each of the sequences in the new environment.
