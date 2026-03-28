export class ActionNotFoundError extends Error {
  constructor(action: string) {
    super(`Action '${action}' not found`);
    this.name = "ActionNotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class InvalidResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidResponseError";
  }
}
