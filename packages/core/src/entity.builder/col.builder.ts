export class Builder {
    text<const Col extends string>(col: Col) {}

    int<const Col extends string>(col: Col) {}

    real<const Col extends string>(col: Col) {}

    blob<const Col extends string>(col: Col) {}
}
