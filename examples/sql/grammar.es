#language ../../languages/grammar

grammar SQL

root Views
  = head:View tail:(_ View)*
  => (head, tail)

rule View
  = "view" __ name:Identifier __ "=" __ query:Query
  => (name, query)

support Query
  = Select
  / Insert

rule Select
  = "SELECT" __ fields:Fields __ "FROM" __ table:TableName
  => (fields, table)

rule Insert
  = "INSERT" __ "INTO" __ table:TableName __ "VALUES" __ values:Values
  => (table, values)

support TableName
  = WildcardName
  / Identifier

support Values
  = head:Identifier tail:(__ Identifier)*
  => (head, tail)

rule WildcardName
  = "*"

rule Identifier
  = name:[a-z_]+
  => (name)

support __
  = [ \t\n\r]+

support _
  = [ \t\n\r]*