namespace SPECTOR.States {

    @Decorators.state("AlignmentState")
    export class AlignmentState extends ParameterState {

        protected getWebgl1Parameters(): IParameter[] {
            return [{ constant: WebGlConstants.PACK_ALIGNMENT, changeCommands: ["pixelStorei"] },
                    { constant: WebGlConstants.UNPACK_ALIGNMENT, changeCommands: ["pixelStorei"] },
                    { constant: WebGlConstants.UNPACK_COLORSPACE_CONVERSION_WEBGL, returnType: ParameterReturnType.GlEnum, changeCommands: ["pixelStorei"] },
                    { constant: WebGlConstants.UNPACK_FLIP_Y_WEBGL, changeCommands: ["pixelStorei"] },
                    { constant: WebGlConstants.UNPACK_PREMULTIPLY_ALPHA_WEBGL, changeCommands: ["pixelStorei"] }];
        }

        protected getWebgl2Parameters(): IParameter[] {
            return [{ constant: WebGlConstants.PACK_ROW_LENGTH, changeCommands: ["pixelStorei"] },
                    { constant: WebGlConstants.PACK_SKIP_PIXELS, changeCommands: ["pixelStorei"] },
                    { constant: WebGlConstants.PACK_SKIP_ROWS, changeCommands: ["pixelStorei"] },
                    { constant: WebGlConstants.UNPACK_IMAGE_HEIGHT, changeCommands: ["pixelStorei"] },
                    { constant: WebGlConstants.UNPACK_SKIP_PIXELS, changeCommands: ["pixelStorei"] },
                    { constant: WebGlConstants.UNPACK_SKIP_ROWS, changeCommands: ["pixelStorei"] },
                    { constant: WebGlConstants.UNPACK_SKIP_IMAGES, changeCommands: ["pixelStorei"] }];
        }

        protected getConsumeCommands(): string[] {
            return [ "readPixels", "texImage2D", "texSubImage2D" ];
        }

        protected isValidChangeCommand(command: ICommandCapture, stateName: string): boolean {
             return WebGlConstantsByName[stateName].value == command.commandArguments[0];
        }
    }
}