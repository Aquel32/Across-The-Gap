import { saveFileAsync } from '@/lib/storage';
import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { Text, View } from "react-native";
import { TrashIcon } from 'react-native-heroicons/outline';
import Modal from "react-native-modal";
import Button from './Button';
import { useSFX } from './SFXProvider';

export default function Options() {
    const sfx = useSFX();

    const [resetDataModalState, changeResetDataModalState] = useState(false);
    function resetData() {
        saveFileAsync("custom_levels.json", "[]")
        changeResetDataModalState(false)
    }

    return <View className=''>
        <View className='flex flex-col items-center justify-center'>
            <View>
                <Text>VOLUME</Text>
                <Slider
                    value={sfx.volume * 100}
                    onValueChange={(e) => sfx.setVolume(e / 100)}
                    style={{ width: 200, height: 40 }}
                    minimumValue={0}
                    maximumValue={100}
                    minimumTrackTintColor="#FFFFFF"
                    maximumTrackTintColor="#000000"
                />
            </View>
            <View className='flex flex-col items-center gap-3'>
                <Text>RESET STORAGE</Text>
                <Button
                    className="bg-amber-500 px-4 py-2 rounded"
                    onPress={() => changeResetDataModalState(true)}
                    hapticStyle={"Light"}
                    sound="click"
                >
                    <TrashIcon color={"white"} />
                </Button>
            </View>
        </View>

        <View style={{ flex: 1 }} className="absolute">
            <Modal
                isVisible={resetDataModalState}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropColor="transparent"
            >
                <View className="bg-white p-5 rounded-lg flex items-center">
                    <Text>CZY NAPEWNO CHCESZ USUNĄĆ WSZYSTKIE DANE?</Text>
                    <Text>(nie da się cofnąć)</Text>
                    <View className="flex flex-row gap-5 m-10">
                        <Button
                            className="bg-red-500 px-4 py-2 rounded"
                            onPress={() => changeResetDataModalState(false)}
                            hapticStyle="Heavy"
                            sound="error"
                        >
                            <Text>NIE</Text>
                        </Button>
                        <Button
                            className="bg-green-500 px-4 py-2 rounded"
                            onPress={() => {
                                resetData();
                            }}
                            hapticStyle="Heavy"
                            sound="success"
                        >
                            <Text>TAK</Text>
                        </Button>
                    </View>
                </View>
            </Modal>
        </View>
    </View>
}