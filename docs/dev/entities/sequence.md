# Sequences

Sequences are the bread and butter of EQUIP - they store all data coded by users.
 
When created, they have one value chosen from each parameter of the `sequence_parameter`s belonging to the `observation`'s `environment`, as well as a reference to the `subject` for which they were created. 

Note: When pulled from the database, the `Sequence` class adds current `subject` data to the sequence to ensure that calculations are not based on old demographic data.
