# Sequence and Subject Parameters

`sequence_parameter`s and `subject_parameter`s have references to both the `environment` and `observation` to which they belong, in the `envId` and `obsId` properties respectively.

`sequence_parameter`s are used when coding `observation`s - the `parameters` property holds an array of objects like this:

```json
{
  "_id": "ixHSzWYd4Xw6imnuY",
  "parameters": [
    {
      "label": "Student Talk (Type)",
      "options": [
        "Explanation",
        "Procedural",
        "Factual/Recall"
      ]
    },
...
    {
      "label": "Teacher Tone",
      "options": [
        "Enthusiastic",
        "Neutral",
        "Dismissive"
      ]
    }
  ],
  "envId": "GjohXFCEcRwNoYdXa",
  "author": "admin",
  "submitted": "2020-07-27T05:06:03.548Z",
  "userId": "iuwRdkNChdqRxGFEh"
}
```

When the `sequence` is created, an associative array is used with keys for each of the "labels", each with a string value from the options in the "options" array. See the example `sequence` below.

```json

{
  "_id": "Mq9kZnWLnWLPSpTsh",
  "info": {
    "parameters": {
      "Student Talk (Type)": "Factual/Recall",
      "Student Talk (Length)": "Brief Contribution",
      "Teacher Question (Type)": "Factual/Recall",
      "Teacher Wait Time": "Short",
      "Teacher Tone": "Neutral"
    },
    ...
  },
  ...
}

```

`subject_parameter`s are similar, in that when `subject`s are created, the same kind of associative array is created. See below for an example `subject_parameter`s array.

```json
{
  "_id": "z6jZRLige3LPdHLbK",
  "parameters": [
    {
      "label": "Gender",
      "options": [
        "Boy",
        "Girl",
        "Nonbinary"
      ]
    },
...
    {
      "label": "Popularity",
      "options": [
        "Very Popular",
        "Not-As-Popular"
      ]
    }
  ],
  "envId": "GjohXFCEcRwNoYdXa",
  "author": "admin",
  "submitted": "2020-07-27T05:06:03.546Z",
  "userId": "iuwRdkNChdqRxGFEh"
}
```

And here's an example of the demographics array on a `subject`.

```json
{
  "_id": "k4J8tgzr27jDSr6Fv",
  "info": {
    "demographics": {
      "Gender": "Boy",
      "SES": "Higher",
      "Race": "White",
      "Language Proficiency": "English Dominant",
      "Popularity": "Not-As-Popular"
    },
...
  },
...
}
```
