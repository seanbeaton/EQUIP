# Subjects

`subject`s are the entity used to record sequences. Each `subject` has `subject_parameter`s, recorded on the `info.parameters` key. See the example below:

```json
{
  "_id": "k4J8tgzr27jDSr6Fv",
  "origStudId": "3bi7D9c4YSLDEFpwa",
  "data_x": 0,
  "data_y": 180,
  "info": {
    "name": "Joey",
    "demographics": {
      "Gender": "Boy",
      "SES": "Higher",
      "Race": "White",
      "Language Proficiency": "English Dominant",
      "Popularity": "Not-As-Popular"
    }
  },
  "envId": "GjohXFCEcRwNoYdXa",
  "author": "admin",
  "submitted": "2020-07-27T05:06:03.549Z",
  "userId": "iuwRdkNChdqRxGFEh"
}
```

As seen above, we also have `data_x` and `data_y` values, which are used to place the student boxes on the observatory page.

For students imported with an example classroom, or those created through a different duplication process (shared classrooms, duplication of own classrooms or classrooms shared via a group), the `origStudId` attribute is set to help with debugging.
