 import {create} from 'zustand';
interface IsChangedState {
    isChanged: boolean;
    setIsChanged: (changed: boolean) => void;
}

export const useIsChanged = create<IsChangedState>((set) => ({
    isChanged: false,
    setIsChanged: (changed: boolean) => set({isChanged: changed}),
}));
