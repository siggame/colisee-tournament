import { app, default as scheduler } from "./app";

// equivalent of python's __name__ == "__main__"

if (!module.parent) {
    scheduler();
}

export { app };
