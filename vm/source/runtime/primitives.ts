import {
  Value,
  TypeTag,
  Bool,
  Callable,
  RecordType,
  UnionType,
  Structure,
  Text,
  Float64,
  Tuple
} from "./values";

export function assertBool(value: Value): Bool {
  if (value.tag !== TypeTag.BOOLEAN) {
    throw new TypeError(`Expected a Boolean`);
  }
  return value;
}

export function assertCallable(value: Value): Callable {
  if (
    value.tag !== TypeTag.LAMBDA &&
    value.tag !== TypeTag.PRIMITIVE_PROCEDURE
  ) {
    throw new TypeError(`Expected a Callable`);
  }
  return value;
}

export function assertRecordType(value: any): RecordType {
  if (value instanceof RecordType) {
    return value;
  } else {
    throw new TypeError(`Expected a Record type`);
  }
}

export function assertUnionType(value: any): UnionType {
  if (value instanceof UnionType) {
    return value;
  } else {
    throw new TypeError(`Expected an Union type`);
  }
}

export function assertStructure(value: Value): Structure {
  if (value.tag === TypeTag.VARIANT || value.tag === TypeTag.RECORD) {
    return value;
  } else {
    throw new TypeError(`Expected a Structure type`);
  }
}

export function assertTuple(value: Value): Tuple {
  if (value.tag === TypeTag.TUPLE) {
    return value;
  } else {
    throw new TypeError(`Expected a Tuple type`);
  }
}

export function isTrue(x: Value) {
  const value = assertBool(x);
  return value.value === true;
}

export function equalsText(left: Text, right: Text) {
  return left.value === right.value;
}

export function equalsNumber(left: Float64, right: Float64) {
  return left.value === right.value;
}

export function equalsBool(left: Bool, right: Bool) {
  return left.value === right.value;
}

export function equalsPrimitives(left: Value, right: Value) {
  if (left.tag === TypeTag.TEXT && right.tag === TypeTag.TEXT) {
    return equalsText(left, right);
  } else if (left.tag === TypeTag.FLOAT64 && right.tag === TypeTag.FLOAT64) {
    return equalsNumber(left, right);
  } else if (left.tag === TypeTag.BOOLEAN && right.tag === TypeTag.BOOLEAN) {
    return equalsBool(left, right);
  } else {
    throw new TypeError(`Not a primitive (${left} = ${right}).`);
  }
}
