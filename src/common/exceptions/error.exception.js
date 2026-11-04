export const ApplicationException = ({
  message = "error",
  status = 404,
  issues = undefined,
} = {}) => {
  const error = new Error(message);

  error.cause = { status, issues };

  throw error;
};

export const ConflictException = (message = "conflict", issues = undefined) => {
  return ApplicationException({ message, status: 409, issues });
};

export const NotfoundException = (message = "Notfound", issues = undefined) => {
  return ApplicationException({ message, status: 404, issues });
};

export const BadException = (
  message = "Bad request exception",
  issues = undefined,
) => {
  return ApplicationException({ message, status: 400, issues });
};

export const UnauthorizedException = (
  message = "Unauthorized",
  issues = undefined,
) => {
  return ApplicationException({ message, status: 401, issues });
};

export const ForbiddenException = (
  message = "Forbidden",
  issues = undefined,
) => {
  return ApplicationException({ message, status: 403, issues });
};
