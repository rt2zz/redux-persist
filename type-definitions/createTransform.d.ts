import { TransformIn, TransformOut, TransformConfig, Transform } from "redux-persist";

export default function createTransform<State, Raw>(transformIn: TransformIn<State, Raw>, transformOut: TransformOut<Raw, State>, config?: TransformConfig): Transform<State, Raw>;