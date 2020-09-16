# Observations

`observations` are used to group `sequence`s together to be aggregated in reports. They are marked as either `whole_class` or `small_group`, and will show up as available for either the "Group Work" report type, or the other report type, depending on this value. See below an example whole class observation:
```json
{
  "_id": "Fq68CvZEjuLQd5Y2s",
  "name": "Observation #2 - 9/6",
  "origObsId": "f8zBBMSxggdC8Dkq8",
  "observationType": "whole_class",
  "absent": [
    "cEtnypJQWz6CkZeTL",
    "oxfHgXXr772Dw24h2"
  ],
  "timer": 0,
  "description": "Example observation",
  "observationDate": "2018-09-06",
  "envId": "GjohXFCEcRwNoYdXa",
  "author": "admin",
  "notes": "",
  "submitted": "2020-07-27T05:06:03.918Z",
  "lastModified": "2020-07-27T05:06:03.918Z",
  "userId": "iuwRdkNChdqRxGFEh"
}
```

And here for a small group observation:

```json
{
  "_id": "Nu9SyhF27KWXsC6JM",
  "origObsId": "rhbgjHQpbqiAXEiqd",
  "name": "Small group #1 - 9/15",
  "observationDate": "2018-09-15",
  "observationType": "small_group",
  "timer": 0,
  "description": "Example observation",
  "small_group": [
    "YaYbat5rZYyKBYWyA",
    "JwokSTofs4gw7GZQP",
    "cEtnypJQWz6CkZeTL",
    "oxfHgXXr772Dw24h2"
  ],
  "envId": "GjohXFCEcRwNoYdXa",
  "author": "admin",
  "notes": "",
  "submitted": "2020-07-27T05:06:04.509Z",
  "lastModified": "2020-07-27T05:06:04.509Z",
  "userId": "iuwRdkNChdqRxGFEh"
}
```

As you can see, for whole class observations, the `absent` property is an array of `subject` entity `_ids`, just as with the small group observations and the `small_group` property.

For observations imported with an example classroom, or those created through a different duplication process (shared classrooms, duplication of own classrooms or classrooms shared via a group), the `origObsId` attribute is set to help with debugging.
