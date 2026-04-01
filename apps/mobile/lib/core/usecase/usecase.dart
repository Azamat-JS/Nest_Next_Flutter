import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';

abstract interface class Usecase<SuccessType, Params> {
  Future<Either<Failure, SuccessType>> call(Params params);
}

class NoParams {}
