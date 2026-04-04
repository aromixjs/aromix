class FieldBuilder {
  string(fieldName: string) {
    return this;
  }

  unique() {
    return this;
  }

  notNullable() {
    return this;
  }

  boolean(fieldName: string) {
    return this;
  }

  date(fieldName: string) {
    return this;
  }
}

export class Model {
  defineDocument(name: string, cb: (fb: FieldBuilder) => void) {
    const builder = new FieldBuilder();

    cb(builder);
  }
}
