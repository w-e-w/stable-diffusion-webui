import os
from modules import paths_internal


def preload(parser):
    parser.add_argument("--swinir-models-path", type=str, help="Path to directory with SwinIR model file(s).", default=os.path.join(paths_internal.models_path, 'SwinIR'))
