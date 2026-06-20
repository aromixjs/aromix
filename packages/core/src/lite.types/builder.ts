export interface Builder {
	text<const Col extends string>(col: Col): TextModifier<Col>
	int<const Col extends string>(col: Col): IntModifier<Col>
	real<const Col extends string>(col: Col): RealModifier<Col>
	blob<const Col extends string>(col: Col): BlobModifier<Col>
}