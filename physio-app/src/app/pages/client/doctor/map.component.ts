import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'map-doctor',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="px-3">
        <div id="map" class="w-full h-full">
            <div
            style="width: 100%; height: 100%; position: relative; overflow: hidden"
            >
            <div
                style="
                height: 100%;
                width: 100%;
                position: absolute;
                top: 0px;
                left: 0px;
                background-color: rgb(229, 227, 223);
                "
            >
                <div>
                <button
                    draggable="false"
                    aria-label="Phím tắt"
                    title="Phím tắt"
                    type="button"
                    style="
                    background: none transparent;
                    display: block;
                    border: none;
                    margin: 0px;
                    padding: 0px;
                    text-transform: none;
                    appearance: none;
                    position: absolute;
                    cursor: pointer;
                    user-select: none;
                    z-index: 1000002;
                    outline-offset: 3px;
                    right: 0px;
                    bottom: 0px;
                    transform: translateX(100%);
                    "
                ></button>
                </div>
                <div
                tabindex="0"
                aria-label="Bản đồ"
                aria-roledescription="bản đồ"
                role="region"
                aria-describedby="5798DA59-2A7D-4257-8E11-B8BC2C232346"
                style="
                    position: absolute;
                    height: 100%;
                    width: 100%;
                    padding: 0px;
                    border-width: 0px;
                    margin: 0px;
                    left: 0px;
                    top: 0px;
                "
                >
                <div id="5798DA59-2A7D-4257-8E11-B8BC2C232346" style="display: none">
                    <div class="LGLeeN-keyboard-shortcuts-view">
                    <table>
                        <tbody>
                        <tr>
                            <td><kbd aria-label="Mũi tên trái">←</kbd></td>
                            <td aria-label="Di chuyển sang trái.">
                            Di chuyển sang trái
                            </td>
                        </tr>
                        <tr>
                            <td><kbd aria-label="Mũi tên phải">→</kbd></td>
                            <td aria-label="Di chuyển sang phải.">
                            Di chuyển sang phải
                            </td>
                        </tr>
                        <tr>
                            <td><kbd aria-label="Mũi tên lên">↑</kbd></td>
                            <td aria-label="Di chuyển lên.">Di chuyển lên</td>
                        </tr>
                        <tr>
                            <td><kbd aria-label="Mũi tên xuống">↓</kbd></td>
                            <td aria-label="Di chuyển xuống.">Di chuyển xuống</td>
                        </tr>
                        <tr>
                            <td><kbd>+</kbd></td>
                            <td aria-label="Phóng to.">Phóng to</td>
                        </tr>
                        <tr>
                            <td><kbd>-</kbd></td>
                            <td aria-label="Thu nhỏ.">Thu nhỏ</td>
                        </tr>
                        <tr>
                            <td><kbd>Di chuyển lên trên</kbd></td>
                            <td aria-label="Di chuyển sang trái 75%.">
                            Di chuyển sang trái 75%
                            </td>
                        </tr>
                        <tr>
                            <td><kbd>Di chuyển xuống dưới</kbd></td>
                            <td aria-label="Di chuyển sang phải 75%.">
                            Di chuyển sang phải 75%
                            </td>
                        </tr>
                        <tr>
                            <td><kbd>Di chuyển lên</kbd></td>
                            <td aria-label="Di chuyển lên trên 75%.">
                            Di chuyển lên trên 75%
                            </td>
                        </tr>
                        <tr>
                            <td><kbd>Di chuyển xuống</kbd></td>
                            <td aria-label="Di chuyển xuống dưới 75%.">
                            Di chuyển xuống dưới 75%
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    </div>
                </div>
                </div>
                <div
                class="gm-style"
                style="
                    position: absolute;
                    z-index: 0;
                    left: 0px;
                    top: 0px;
                    height: 100%;
                    width: 100%;
                    padding: 0px;
                    border-width: 0px;
                    margin: 0px;
                "
                >
                <div
                    style="
                    position: absolute;
                    z-index: 0;
                    left: 0px;
                    top: 0px;
                    height: 100%;
                    width: 100%;
                    padding: 0px;
                    border-width: 0px;
                    margin: 0px;
                    cursor: url('https://maps.gstatic.com/mapfiles/openhand_8_8.cur'),
                        default;
                    touch-action: pan-x pan-y;
                    "
                >
                    <div
                    style="
                        z-index: 1;
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        width: 100%;
                        will-change: transform;
                        transform: translate(0px, 0px);
                    "
                    >
                    <div
                        style="
                        position: absolute;
                        left: 0px;
                        top: 0px;
                        z-index: 100;
                        width: 100%;
                        "
                    >
                        <div
                        style="position: absolute; left: 0px; top: 0px; z-index: 0"
                        >
                        <div
                            style="
                            position: absolute;
                            z-index: 986;
                            transform: matrix(1, 0, 0, 1, -243, -84);
                            "
                        >
                            <div
                            style="
                                position: absolute;
                                left: 256px;
                                top: 0px;
                                width: 256px;
                                height: 256px;
                            "
                            >
                            <div style="width: 256px; height: 256px"></div>
                            </div>
                            <div
                            style="
                                position: absolute;
                                left: 0px;
                                top: 0px;
                                width: 256px;
                                height: 256px;
                            "
                            >
                            <div style="width: 256px; height: 256px"></div>
                            </div>
                            <div
                            style="
                                position: absolute;
                                left: 0px;
                                top: -256px;
                                width: 256px;
                                height: 256px;
                            "
                            >
                            <div style="width: 256px; height: 256px"></div>
                            </div>
                            <div
                            style="
                                position: absolute;
                                left: 256px;
                                top: -256px;
                                width: 256px;
                                height: 256px;
                            "
                            >
                            <div style="width: 256px; height: 256px"></div>
                            </div>
                            <div
                            style="
                                position: absolute;
                                left: 256px;
                                top: 256px;
                                width: 256px;
                                height: 256px;
                            "
                            >
                            <div style="width: 256px; height: 256px"></div>
                            </div>
                            <div
                            style="
                                position: absolute;
                                left: 0px;
                                top: 256px;
                                width: 256px;
                                height: 256px;
                            "
                            >
                            <div style="width: 256px; height: 256px"></div>
                            </div>
                            <div
                            style="
                                position: absolute;
                                left: 0px;
                                top: -512px;
                                width: 256px;
                                height: 256px;
                            "
                            >
                            <div style="width: 256px; height: 256px"></div>
                            </div>
                            <div
                            style="
                                position: absolute;
                                left: 256px;
                                top: -512px;
                                width: 256px;
                                height: 256px;
                            "
                            >
                            <div style="width: 256px; height: 256px"></div>
                            </div>
                            <div
                            style="
                                position: absolute;
                                left: 256px;
                                top: 512px;
                                width: 256px;
                                height: 256px;
                            "
                            >
                            <div style="width: 256px; height: 256px"></div>
                            </div>
                            <div
                            style="
                                position: absolute;
                                left: 0px;
                                top: 512px;
                                width: 256px;
                                height: 256px;
                            "
                            >
                            <div style="width: 256px; height: 256px"></div>
                            </div>
                            <div
                            style="
                                position: absolute;
                                left: 0px;
                                top: -768px;
                                width: 256px;
                                height: 256px;
                            "
                            >
                            <div style="width: 256px; height: 256px"></div>
                            </div>
                            <div
                            style="
                                position: absolute;
                                left: 256px;
                                top: -768px;
                                width: 256px;
                                height: 256px;
                            "
                            >
                            <div style="width: 256px; height: 256px"></div>
                            </div>
                            <div
                            style="
                                position: absolute;
                                left: 256px;
                                top: 768px;
                                width: 256px;
                                height: 256px;
                            "
                            >
                            <div style="width: 256px; height: 256px"></div>
                            </div>
                            <div
                            style="
                                position: absolute;
                                left: 0px;
                                top: 768px;
                                width: 256px;
                                height: 256px;
                            "
                            >
                            <div style="width: 256px; height: 256px"></div>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div
                        style="
                        position: absolute;
                        left: 0px;
                        top: 0px;
                        z-index: 101;
                        width: 100%;
                        "
                    ></div>
                    <div
                        style="
                        position: absolute;
                        left: 0px;
                        top: 0px;
                        z-index: 102;
                        width: 100%;
                        "
                    ></div>
                    <div
                        style="
                        position: absolute;
                        left: 0px;
                        top: 0px;
                        z-index: 103;
                        width: 100%;
                        "
                    >
                        <div
                        style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: -13px;
                            top: -37px;
                            z-index: 0;
                        "
                        >
                        <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3_hdpi.png"
                            draggable="false"
                            style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            width: 26px;
                            height: 37px;
                            user-select: none;
                            border: 0px;
                            padding: 0px;
                            margin: 0px;
                            max-width: none;
                            "
                        />
                        </div>
                        <div
                        style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 233px;
                            top: -8px;
                            z-index: 29;
                        "
                        >
                        <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3_hdpi.png"
                            draggable="false"
                            style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            width: 26px;
                            height: 37px;
                            user-select: none;
                            border: 0px;
                            padding: 0px;
                            margin: 0px;
                            max-width: none;
                            "
                        />
                        </div>
                        <div
                        style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 349px;
                            top: 2px;
                            z-index: 39;
                        "
                        >
                        <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3_hdpi.png"
                            draggable="false"
                            style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            width: 26px;
                            height: 37px;
                            user-select: none;
                            border: 0px;
                            padding: 0px;
                            margin: 0px;
                            max-width: none;
                            "
                        />
                        </div>
                        <div
                        style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                        "
                        >
                        <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3_hdpi.png"
                            draggable="false"
                            style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            width: 26px;
                            height: 37px;
                            user-select: none;
                            border: 0px;
                            padding: 0px;
                            margin: 0px;
                            max-width: none;
                            "
                        />
                        </div>
                        <div
                        style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                        "
                        >
                        <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3_hdpi.png"
                            draggable="false"
                            style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            width: 26px;
                            height: 37px;
                            user-select: none;
                            border: 0px;
                            padding: 0px;
                            margin: 0px;
                            max-width: none;
                            "
                        />
                        </div>
                        <div
                        style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                        "
                        >
                        <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3_hdpi.png"
                            draggable="false"
                            style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            width: 26px;
                            height: 37px;
                            user-select: none;
                            border: 0px;
                            padding: 0px;
                            margin: 0px;
                            max-width: none;
                            "
                        />
                        </div>
                        <div
                        style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                        "
                        >
                        <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3_hdpi.png"
                            draggable="false"
                            style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            width: 26px;
                            height: 37px;
                            user-select: none;
                            border: 0px;
                            padding: 0px;
                            margin: 0px;
                            max-width: none;
                            "
                        />
                        </div>
                        <div
                        style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                        "
                        >
                        <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3_hdpi.png"
                            draggable="false"
                            style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            width: 26px;
                            height: 37px;
                            user-select: none;
                            border: 0px;
                            padding: 0px;
                            margin: 0px;
                            max-width: none;
                            "
                        />
                        </div>
                        <div
                        style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                        "
                        >
                        <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3_hdpi.png"
                            draggable="false"
                            style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            width: 26px;
                            height: 37px;
                            user-select: none;
                            border: 0px;
                            padding: 0px;
                            margin: 0px;
                            max-width: none;
                            "
                        />
                        </div>
                        <div
                        style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                        "
                        >
                        <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3_hdpi.png"
                            draggable="false"
                            style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            width: 26px;
                            height: 37px;
                            user-select: none;
                            border: 0px;
                            padding: 0px;
                            margin: 0px;
                            max-width: none;
                            "
                        />
                        </div>
                        <div
                        style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                        "
                        >
                        <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3_hdpi.png"
                            draggable="false"
                            style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            width: 26px;
                            height: 37px;
                            user-select: none;
                            border: 0px;
                            padding: 0px;
                            margin: 0px;
                            max-width: none;
                            "
                        />
                        </div>
                        <div
                        style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                        "
                        >
                        <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3_hdpi.png"
                            draggable="false"
                            style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            width: 26px;
                            height: 37px;
                            user-select: none;
                            border: 0px;
                            padding: 0px;
                            margin: 0px;
                            max-width: none;
                            "
                        />
                        </div>
                        <div
                        style="position: absolute; left: 0px; top: 0px; z-index: -1"
                        >
                        <div
                            style="
                            position: absolute;
                            z-index: 986;
                            transform: matrix(1, 0, 0, 1, -243, -84);
                            "
                        >
                            <div
                            style="
                                width: 256px;
                                height: 256px;
                                overflow: hidden;
                                position: absolute;
                                left: 256px;
                                top: 0px;
                            "
                            ></div>
                            <div
                            style="
                                width: 256px;
                                height: 256px;
                                overflow: hidden;
                                position: absolute;
                                left: 0px;
                                top: 0px;
                            "
                            ></div>
                            <div
                            style="
                                width: 256px;
                                height: 256px;
                                overflow: hidden;
                                position: absolute;
                                left: 0px;
                                top: -256px;
                            "
                            ></div>
                            <div
                            style="
                                width: 256px;
                                height: 256px;
                                overflow: hidden;
                                position: absolute;
                                left: 256px;
                                top: -256px;
                            "
                            ></div>
                            <div
                            style="
                                width: 256px;
                                height: 256px;
                                overflow: hidden;
                                position: absolute;
                                left: 256px;
                                top: 256px;
                            "
                            ></div>
                            <div
                            style="
                                width: 256px;
                                height: 256px;
                                overflow: hidden;
                                position: absolute;
                                left: 0px;
                                top: 256px;
                            "
                            ></div>
                            <div
                            style="
                                width: 256px;
                                height: 256px;
                                overflow: hidden;
                                position: absolute;
                                left: 0px;
                                top: -512px;
                            "
                            ></div>
                            <div
                            style="
                                width: 256px;
                                height: 256px;
                                overflow: hidden;
                                position: absolute;
                                left: 256px;
                                top: -512px;
                            "
                            ></div>
                            <div
                            style="
                                width: 256px;
                                height: 256px;
                                overflow: hidden;
                                position: absolute;
                                left: 256px;
                                top: 512px;
                            "
                            ></div>
                            <div
                            style="
                                width: 256px;
                                height: 256px;
                                overflow: hidden;
                                position: absolute;
                                left: 0px;
                                top: 512px;
                            "
                            ></div>
                            <div
                            style="
                                width: 256px;
                                height: 256px;
                                overflow: hidden;
                                position: absolute;
                                left: 0px;
                                top: -768px;
                            "
                            ></div>
                            <div
                            style="
                                width: 256px;
                                height: 256px;
                                overflow: hidden;
                                position: absolute;
                                left: 256px;
                                top: -768px;
                            "
                            ></div>
                            <div
                            style="
                                width: 256px;
                                height: 256px;
                                overflow: hidden;
                                position: absolute;
                                left: 256px;
                                top: 768px;
                            "
                            ></div>
                            <div
                            style="
                                width: 256px;
                                height: 256px;
                                overflow: hidden;
                                position: absolute;
                                left: 0px;
                                top: 768px;
                            "
                            ></div>
                        </div>
                        </div>
                    </div>
                    <div style="position: absolute; left: 0px; top: 0px; z-index: 0">
                        <div
                        style="
                            position: absolute;
                            z-index: 986;
                            transform: matrix(1, 0, 0, 1, -243, -84);
                        "
                        >
                        <div
                            style="
                            position: absolute;
                            left: 256px;
                            top: 0px;
                            width: 256px;
                            height: 256px;
                            transition: opacity 200ms linear;
                            "
                        >
                            <img
                            draggable="false"
                            alt=""
                            role="presentation"
                            src="https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i14!2i8091!3i5301!4i256!2m3!1e0!2sm!3i746506324!2m3!1e2!6m1!3e5!3m18!2svi-VN!3sUS!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcC5zOi02MHxwLmw6LTYw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502&amp;key=AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I&amp;token=20219"
                            style="
                                width: 256px;
                                height: 256px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            />
                        </div>
                        <div
                            style="
                            position: absolute;
                            left: 256px;
                            top: -512px;
                            width: 256px;
                            height: 256px;
                            transition: opacity 200ms linear;
                            "
                        >
                            <img
                            draggable="false"
                            alt=""
                            role="presentation"
                            src="https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i14!2i8091!3i5299!4i256!2m3!1e0!2sm!3i746506324!2m3!1e2!6m1!3e5!3m18!2svi-VN!3sUS!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcC5zOi02MHxwLmw6LTYw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502&amp;key=AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I&amp;token=34814"
                            style="
                                width: 256px;
                                height: 256px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            />
                        </div>
                        <div
                            style="
                            position: absolute;
                            left: 0px;
                            top: 512px;
                            width: 256px;
                            height: 256px;
                            transition: opacity 200ms linear;
                            "
                        >
                            <img
                            draggable="false"
                            alt=""
                            role="presentation"
                            src="https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i14!2i8090!3i5303!4i256!2m3!1e0!2sm!3i746506301!2m3!1e2!6m1!3e5!3m18!2svi-VN!3sUS!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcC5zOi02MHxwLmw6LTYw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502&amp;key=AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I&amp;token=65775"
                            style="
                                width: 256px;
                                height: 256px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            />
                        </div>
                        <div
                            style="
                            position: absolute;
                            left: 256px;
                            top: -256px;
                            width: 256px;
                            height: 256px;
                            transition: opacity 200ms linear;
                            "
                        >
                            <img
                            draggable="false"
                            alt=""
                            role="presentation"
                            src="https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i14!2i8091!3i5300!4i256!2m3!1e0!2sm!3i746506324!2m3!1e2!6m1!3e5!3m18!2svi-VN!3sUS!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcC5zOi02MHxwLmw6LTYw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502&amp;key=AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I&amp;token=82344"
                            style="
                                width: 256px;
                                height: 256px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            />
                        </div>
                        <div
                            style="
                            position: absolute;
                            left: 0px;
                            top: -512px;
                            width: 256px;
                            height: 256px;
                            transition: opacity 200ms linear;
                            "
                        >
                            <img
                            draggable="false"
                            alt=""
                            role="presentation"
                            src="https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i14!2i8090!3i5299!4i256!2m3!1e0!2sm!3i746506324!2m3!1e2!6m1!3e5!3m18!2svi-VN!3sUS!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcC5zOi02MHxwLmw6LTYw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502&amp;key=AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I&amp;token=50263"
                            style="
                                width: 256px;
                                height: 256px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            />
                        </div>
                        <div
                            style="
                            position: absolute;
                            left: 256px;
                            top: -768px;
                            width: 256px;
                            height: 256px;
                            transition: opacity 200ms linear;
                            "
                        >
                            <img
                            draggable="false"
                            alt=""
                            role="presentation"
                            src="https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i14!2i8091!3i5298!4i256!2m3!1e0!2sm!3i746506132!2m3!1e2!6m1!3e5!3m18!2svi-VN!3sUS!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcC5zOi02MHxwLmw6LTYw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502&amp;key=AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I&amp;token=109133"
                            style="
                                width: 256px;
                                height: 256px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            />
                        </div>
                        <div
                            style="
                            position: absolute;
                            left: 256px;
                            top: 256px;
                            width: 256px;
                            height: 256px;
                            transition: opacity 200ms linear;
                            "
                        >
                            <img
                            draggable="false"
                            alt=""
                            role="presentation"
                            src="https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i14!2i8091!3i5302!4i256!2m3!1e0!2sm!3i746506324!2m3!1e2!6m1!3e5!3m18!2svi-VN!3sUS!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcC5zOi02MHxwLmw6LTYw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502&amp;key=AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I&amp;token=89165"
                            style="
                                width: 256px;
                                height: 256px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            />
                        </div>
                        <div
                            style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            width: 256px;
                            height: 256px;
                            transition: opacity 200ms linear;
                            "
                        >
                            <img
                            draggable="false"
                            alt=""
                            role="presentation"
                            src="https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i14!2i8090!3i5301!4i256!2m3!1e0!2sm!3i746506324!2m3!1e2!6m1!3e5!3m18!2svi-VN!3sUS!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcC5zOi02MHxwLmw6LTYw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502&amp;key=AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I&amp;token=35668"
                            style="
                                width: 256px;
                                height: 256px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            />
                        </div>
                        <div
                            style="
                            position: absolute;
                            left: 256px;
                            top: 512px;
                            width: 256px;
                            height: 256px;
                            transition: opacity 200ms linear;
                            "
                        >
                            <img
                            draggable="false"
                            alt=""
                            role="presentation"
                            src="https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i14!2i8091!3i5303!4i256!2m3!1e0!2sm!3i746506312!2m3!1e2!6m1!3e5!3m18!2svi-VN!3sUS!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcC5zOi02MHxwLmw6LTYw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502&amp;key=AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I&amp;token=81897"
                            style="
                                width: 256px;
                                height: 256px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            />
                        </div>
                        <div
                            style="
                            position: absolute;
                            left: 0px;
                            top: 256px;
                            width: 256px;
                            height: 256px;
                            transition: opacity 200ms linear;
                            "
                        >
                            <img
                            draggable="false"
                            alt=""
                            role="presentation"
                            src="https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i14!2i8090!3i5302!4i256!2m3!1e0!2sm!3i746506301!2m3!1e2!6m1!3e5!3m18!2svi-VN!3sUS!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcC5zOi02MHxwLmw6LTYw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502&amp;key=AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I&amp;token=127900"
                            style="
                                width: 256px;
                                height: 256px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            />
                        </div>
                        <div
                            style="
                            position: absolute;
                            left: 0px;
                            top: -768px;
                            width: 256px;
                            height: 256px;
                            transition: opacity 200ms linear;
                            "
                        >
                            <img
                            draggable="false"
                            alt=""
                            role="presentation"
                            src="https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i14!2i8090!3i5298!4i256!2m3!1e0!2sm!3i746506324!2m3!1e2!6m1!3e5!3m18!2svi-VN!3sUS!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcC5zOi02MHxwLmw6LTYw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502&amp;key=AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I&amp;token=112388"
                            style="
                                width: 256px;
                                height: 256px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            />
                        </div>
                        <div
                            style="
                            position: absolute;
                            left: 0px;
                            top: -256px;
                            width: 256px;
                            height: 256px;
                            transition: opacity 200ms linear;
                            "
                        >
                            <img
                            draggable="false"
                            alt=""
                            role="presentation"
                            src="https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i14!2i8090!3i5300!4i256!2m3!1e0!2sm!3i746506324!2m3!1e2!6m1!3e5!3m18!2svi-VN!3sUS!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcC5zOi02MHxwLmw6LTYw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502&amp;key=AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I&amp;token=97793"
                            style="
                                width: 256px;
                                height: 256px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            />
                        </div>
                        <div
                            style="
                            position: absolute;
                            left: 256px;
                            top: 768px;
                            width: 256px;
                            height: 256px;
                            transition: opacity 200ms linear;
                            "
                        >
                            <img
                            draggable="false"
                            alt=""
                            role="presentation"
                            src="https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i14!2i8091!3i5304!4i256!2m3!1e0!2sm!3i746506252!2m3!1e2!6m1!3e5!3m18!2svi-VN!3sUS!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcC5zOi02MHxwLmw6LTYw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502&amp;key=AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I&amp;token=24760"
                            style="
                                width: 256px;
                                height: 256px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            />
                        </div>
                        <div
                            style="
                            position: absolute;
                            left: 0px;
                            top: 768px;
                            width: 256px;
                            height: 256px;
                            transition: opacity 200ms linear;
                            "
                        >
                            <img
                            draggable="false"
                            alt=""
                            role="presentation"
                            src="https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i14!2i8090!3i5304!4i256!2m3!1e0!2sm!3i746506276!2m3!1e2!6m1!3e5!3m18!2svi-VN!3sUS!5e18!12m5!1e68!2m2!1sset!2sRoadmap!4e2!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcC5zOi02MHxwLmw6LTYw!4e0!5m2!1e3!5f2!23i46991212!23i47054750!23i47083502&amp;key=AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I&amp;token=61566"
                            style="
                                width: 256px;
                                height: 256px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            />
                        </div>
                        </div>
                    </div>
                    </div>
                    <div
                    style="
                        z-index: 3;
                        position: absolute;
                        height: 100%;
                        width: 100%;
                        padding: 0px;
                        border-width: 0px;
                        margin: 0px;
                        left: 0px;
                        top: 0px;
                        touch-action: pan-x pan-y;
                    "
                    >
                    <div
                        style="
                        z-index: 4;
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        width: 100%;
                        will-change: transform;
                        transform: translate(0px, 0px);
                        "
                    >
                        <div
                        style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            z-index: 104;
                            width: 100%;
                        "
                        ></div>
                        <div
                        style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            z-index: 105;
                            width: 100%;
                        "
                        ></div>
                        <div
                        style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            z-index: 106;
                            width: 100%;
                        "
                        >
                        <slot></slot
                        ><span
                            id="5862385B-6143-4A5D-8E92-75ED951119D6"
                            aria-live="polite"
                            style="
                            position: absolute;
                            width: 1px;
                            height: 1px;
                            margin: -1px;
                            padding: 0px;
                            overflow: hidden;
                            clip-path: inset(100%);
                            white-space: nowrap;
                            border: 0px;
                            "
                        ></span>
                        <div
                            role="button"
                            style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: -13px;
                            top: -37px;
                            z-index: 0;
                            "
                            tabindex="0"
                        >
                            <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/transparent.png"
                            draggable="false"
                            usemap="#gmimap0"
                            style="
                                width: 26px;
                                height: 37px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            /><map name="gmimap0" id="gmimap0"
                            ><area
                                log="miw"
                                coords="13,0,4,3.5,0,12,2.75,21,13,37,23.5,21,26,12,22,3.5"
                                shape="poly"
                                tabindex="-1"
                                title=""
                                style="
                                display: inline;
                                position: absolute;
                                left: 0px;
                                top: 0px;
                                cursor: pointer;
                                touch-action: none;
                                "
                            /></map>
                        </div>
                        <div
                            role="button"
                            style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 233px;
                            top: -8px;
                            z-index: 29;
                            "
                            tabindex="-1"
                        >
                            <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/transparent.png"
                            draggable="false"
                            usemap="#gmimap1"
                            style="
                                width: 26px;
                                height: 37px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            /><map name="gmimap1" id="gmimap1"
                            ><area
                                log="miw"
                                coords="13,0,4,3.5,0,12,2.75,21,13,37,23.5,21,26,12,22,3.5"
                                shape="poly"
                                tabindex="-1"
                                title=""
                                style="
                                display: inline;
                                position: absolute;
                                left: 0px;
                                top: 0px;
                                cursor: pointer;
                                touch-action: none;
                                "
                            /></map>
                        </div>
                        <div
                            role="button"
                            style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 349px;
                            top: 2px;
                            z-index: 39;
                            "
                            tabindex="-1"
                        >
                            <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/transparent.png"
                            draggable="false"
                            usemap="#gmimap2"
                            style="
                                width: 26px;
                                height: 37px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            /><map name="gmimap2" id="gmimap2"
                            ><area
                                log="miw"
                                coords="13,0,4,3.5,0,12,2.75,21,13,37,23.5,21,26,12,22,3.5"
                                shape="poly"
                                tabindex="-1"
                                title=""
                                style="
                                display: inline;
                                position: absolute;
                                left: 0px;
                                top: 0px;
                                cursor: pointer;
                                touch-action: none;
                                "
                            /></map>
                        </div>
                        <div
                            role="button"
                            style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                            "
                            tabindex="-1"
                        >
                            <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/transparent.png"
                            draggable="false"
                            usemap="#gmimap3"
                            style="
                                width: 26px;
                                height: 37px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            /><map name="gmimap3" id="gmimap3"
                            ><area
                                log="miw"
                                coords="13,0,4,3.5,0,12,2.75,21,13,37,23.5,21,26,12,22,3.5"
                                shape="poly"
                                tabindex="-1"
                                title=""
                                style="
                                display: inline;
                                position: absolute;
                                left: 0px;
                                top: 0px;
                                cursor: pointer;
                                touch-action: none;
                                "
                            /></map>
                        </div>
                        <div
                            role="button"
                            style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                            "
                            tabindex="-1"
                        >
                            <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/transparent.png"
                            draggable="false"
                            usemap="#gmimap4"
                            style="
                                width: 26px;
                                height: 37px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            /><map name="gmimap4" id="gmimap4"
                            ><area
                                log="miw"
                                coords="13,0,4,3.5,0,12,2.75,21,13,37,23.5,21,26,12,22,3.5"
                                shape="poly"
                                tabindex="-1"
                                title=""
                                style="
                                display: inline;
                                position: absolute;
                                left: 0px;
                                top: 0px;
                                cursor: pointer;
                                touch-action: none;
                                "
                            /></map>
                        </div>
                        <div
                            role="button"
                            style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                            "
                            tabindex="-1"
                        >
                            <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/transparent.png"
                            draggable="false"
                            usemap="#gmimap5"
                            style="
                                width: 26px;
                                height: 37px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            /><map name="gmimap5" id="gmimap5"
                            ><area
                                log="miw"
                                coords="13,0,4,3.5,0,12,2.75,21,13,37,23.5,21,26,12,22,3.5"
                                shape="poly"
                                tabindex="-1"
                                title=""
                                style="
                                display: inline;
                                position: absolute;
                                left: 0px;
                                top: 0px;
                                cursor: pointer;
                                touch-action: none;
                                "
                            /></map>
                        </div>
                        <div
                            role="button"
                            style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                            "
                            tabindex="-1"
                        >
                            <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/transparent.png"
                            draggable="false"
                            usemap="#gmimap6"
                            style="
                                width: 26px;
                                height: 37px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            /><map name="gmimap6" id="gmimap6"
                            ><area
                                log="miw"
                                coords="13,0,4,3.5,0,12,2.75,21,13,37,23.5,21,26,12,22,3.5"
                                shape="poly"
                                tabindex="-1"
                                title=""
                                style="
                                display: inline;
                                position: absolute;
                                left: 0px;
                                top: 0px;
                                cursor: pointer;
                                touch-action: none;
                                "
                            /></map>
                        </div>
                        <div
                            role="button"
                            style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                            "
                            tabindex="-1"
                        >
                            <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/transparent.png"
                            draggable="false"
                            usemap="#gmimap7"
                            style="
                                width: 26px;
                                height: 37px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            /><map name="gmimap7" id="gmimap7"
                            ><area
                                log="miw"
                                coords="13,0,4,3.5,0,12,2.75,21,13,37,23.5,21,26,12,22,3.5"
                                shape="poly"
                                tabindex="-1"
                                title=""
                                style="
                                display: inline;
                                position: absolute;
                                left: 0px;
                                top: 0px;
                                cursor: pointer;
                                touch-action: none;
                                "
                            /></map>
                        </div>
                        <div
                            role="button"
                            style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                            "
                            tabindex="-1"
                        >
                            <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/transparent.png"
                            draggable="false"
                            usemap="#gmimap8"
                            style="
                                width: 26px;
                                height: 37px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            /><map name="gmimap8" id="gmimap8"
                            ><area
                                log="miw"
                                coords="13,0,4,3.5,0,12,2.75,21,13,37,23.5,21,26,12,22,3.5"
                                shape="poly"
                                tabindex="-1"
                                title=""
                                style="
                                display: inline;
                                position: absolute;
                                left: 0px;
                                top: 0px;
                                cursor: pointer;
                                touch-action: none;
                                "
                            /></map>
                        </div>
                        <div
                            role="button"
                            style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                            "
                            tabindex="-1"
                        >
                            <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/transparent.png"
                            draggable="false"
                            usemap="#gmimap9"
                            style="
                                width: 26px;
                                height: 37px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            /><map name="gmimap9" id="gmimap9"
                            ><area
                                log="miw"
                                coords="13,0,4,3.5,0,12,2.75,21,13,37,23.5,21,26,12,22,3.5"
                                shape="poly"
                                tabindex="-1"
                                title=""
                                style="
                                display: inline;
                                position: absolute;
                                left: 0px;
                                top: 0px;
                                cursor: pointer;
                                touch-action: none;
                                "
                            /></map>
                        </div>
                        <div
                            role="button"
                            style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                            "
                            tabindex="-1"
                        >
                            <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/transparent.png"
                            draggable="false"
                            usemap="#gmimap10"
                            style="
                                width: 26px;
                                height: 37px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            /><map name="gmimap10" id="gmimap10"
                            ><area
                                log="miw"
                                coords="13,0,4,3.5,0,12,2.75,21,13,37,23.5,21,26,12,22,3.5"
                                shape="poly"
                                tabindex="-1"
                                title=""
                                style="
                                display: inline;
                                position: absolute;
                                left: 0px;
                                top: 0px;
                                cursor: pointer;
                                touch-action: none;
                                "
                            /></map>
                        </div>
                        <div
                            role="button"
                            style="
                            width: 26px;
                            height: 37px;
                            overflow: hidden;
                            position: absolute;
                            left: 482px;
                            top: 96px;
                            z-index: 133;
                            "
                            tabindex="-1"
                        >
                            <img
                            alt=""
                            src="https://maps.gstatic.com/mapfiles/transparent.png"
                            draggable="false"
                            usemap="#gmimap11"
                            style="
                                width: 26px;
                                height: 37px;
                                user-select: none;
                                border: 0px;
                                padding: 0px;
                                margin: 0px;
                                max-width: none;
                            "
                            /><map name="gmimap11" id="gmimap11"
                            ><area
                                log="miw"
                                coords="13,0,4,3.5,0,12,2.75,21,13,37,23.5,21,26,12,22,3.5"
                                shape="poly"
                                tabindex="-1"
                                title=""
                                style="
                                display: inline;
                                position: absolute;
                                left: 0px;
                                top: 0px;
                                cursor: pointer;
                                touch-action: none;
                                "
                            /></map>
                        </div>
                        </div>
                        <div
                        style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            z-index: 107;
                            width: 100%;
                        "
                        >
                        <div
                            style="
                            cursor: default;
                            position: absolute;
                            top: 0px;
                            left: 0px;
                            z-index: -235;
                            "
                        >
                            <div
                            class="gm-style-iw-a"
                            style="position: absolute; left: 0px; top: 0px"
                            >
                            <div
                                class="gm-style-iw-t"
                                style="right: 0px; bottom: 11px"
                            >
                                <div
                                role="dialog"
                                tabindex="-1"
                                class="gm-style-iw gm-style-iw-c"
                                aria-labelledby="30D1543D-6329-4C42-A8DB-C75BCC570E5A"
                                style="
                                    padding-inline-end: 0px;
                                    padding-bottom: 0px;
                                    padding-top: 0px;
                                    max-width: 180px;
                                    max-height: 1203px;
                                    min-width: 0px;
                                "
                                >
                                <div class="gm-style-iw-chr">
                                    <div
                                    class="gm-style-iw-ch"
                                    id="30D1543D-6329-4C42-A8DB-C75BCC570E5A"
                                    ></div>
                                    <button
                                    draggable="false"
                                    aria-label="Đóng"
                                    title="Đóng"
                                    type="button"
                                    class="gm-ui-hover-effect"
                                    style="
                                        background: none;
                                        display: block;
                                        border: 0px;
                                        margin: 0px;
                                        padding: 0px;
                                        text-transform: none;
                                        appearance: none;
                                        position: relative;
                                        cursor: pointer;
                                        user-select: none;
                                        width: 48px;
                                        height: 48px;
                                    "
                                    >
                                    <span
                                        style="
                                        mask-image: url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M19%206.41L17.59%205%2012%2010.59%206.41%205%205%206.41%2010.59%2012%205%2017.59%206.41%2019%2012%2013.41%2017.59%2019%2019%2017.59%2013.41%2012z%22/%3E%3Cpath%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22/%3E%3C/svg%3E');
                                        pointer-events: none;
                                        display: block;
                                        width: 24px;
                                        height: 24px;
                                        margin: 12px;
                                        "
                                    ></span>
                                    </button>
                                </div>
                                <div
                                    class="gm-style-iw-d"
                                    style="overflow: scroll; max-height: 1185px"
                                >
                                    <div>
                                    <div>
                                        <div
                                        class="card border-0"
                                        style="width: 100%; display: inline-block"
                                        >
                                        <div class="card-body">
                                            <div
                                            class="doc-img d-flex align-items-center"
                                            >
                                            <a
                                                class="avatar flex-shrink-0 me-2 avatar-xl avatar-rounded"
                                                tabindex="0"
                                                href="/react/template/patient/doctor-profile"
                                                target="_blank"
                                                data-discover="true"
                                                ><img
                                                class="img-fluid"
                                                alt="Dr. John Gibbs"
                                                src="/react/template/src/assets/img/doctor-grid/doctor-grid-01.jpg"
                                            /></a>
                                            <div>
                                                <h6 class="title fs-16 mb-1">
                                                <a
                                                    tabindex="0"
                                                    href="/react/template/patient/doctor-profile"
                                                    data-discover="true"
                                                    >Dr. Michael Brown</a
                                                ><span class="badge bg-orange mt-1"
                                                    ><i
                                                    class="fa-solid fa-star me-1"
                                                    ></i
                                                    >17</span
                                                >
                                                </h6>
                                                <p class="speciality text-indigo">
                                                Psychologist
                                                </p>
                                            </div>
                                            </div>
                                            <div class="pro-content">
                                            <ul class="available-info">
                                                <li>
                                                <i class="fas fa-map-marker-alt"></i>
                                                Minneapolis, MN
                                                </li>
                                            </ul>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </div>
                                <div class="gm-style-iw-tc"></div>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div
                    class="gm-style-moc"
                    style="
                        z-index: 4;
                        position: absolute;
                        height: 100%;
                        width: 100%;
                        padding: 0px;
                        border-width: 0px;
                        margin: 0px;
                        left: 0px;
                        top: 0px;
                        transition-property: opacity, display;
                        transition-behavior: allow-discrete;
                        opacity: 0;
                        display: none;
                    "
                    >
                    <p class="gm-style-mot"></p>
                    </div>
                </div>
                <iframe
                    aria-hidden="true"
                    frameborder="0"
                    tabindex="-1"
                    style="
                    z-index: -1;
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0px;
                    left: 0px;
                    border: none;
                    opacity: 0;
                    "
                ></iframe>
                <div
                    style="
                    pointer-events: none;
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    position: absolute;
                    z-index: 1000002;
                    opacity: 0;
                    border: 2px solid rgb(26, 115, 232);
                    "
                ></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div>
                    <button
                    draggable="false"
                    aria-label="Chuyển đổi chế độ xem toàn màn hình"
                    title="Chuyển đổi chế độ xem toàn màn hình"
                    type="button"
                    aria-pressed="false"
                    class="gm-control-active gm-fullscreen-control"
                    style="
                        background: none rgb(255, 255, 255);
                        border: 0px;
                        margin: 10px;
                        padding: 0px;
                        text-transform: none;
                        appearance: none;
                        position: absolute;
                        cursor: pointer;
                        user-select: none;
                        border-radius: 2px;
                        height: 40px;
                        width: 40px;
                        box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
                        overflow: hidden;
                        top: 0px;
                        right: 0px;
                    "
                    >
                    <img
                        src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M0%200v6h2V2h4V0H0zm16%200h-4v2h4v4h2V0h-2zm0%2016h-4v2h6v-6h-2v4zM2%2012H0v6h6v-2H2v-4z%22/%3E%3C/svg%3E"
                        alt=""
                        style="height: 18px; width: 18px"
                    /><img
                        src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M0%200v6h2V2h4V0H0zm16%200h-4v2h4v4h2V0h-2zm0%2016h-4v2h6v-6h-2v4zM2%2012H0v6h6v-2H2v-4z%22/%3E%3C/svg%3E"
                        alt=""
                        style="height: 18px; width: 18px"
                    /><img
                        src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23111%22%20d%3D%22M0%200v6h2V2h4V0H0zm16%200h-4v2h4v4h2V0h-2zm0%2016h-4v2h6v-6h-2v4zM2%2012H0v6h6v-2H2v-4z%22/%3E%3C/svg%3E"
                        alt=""
                        style="height: 18px; width: 18px"
                    />
                    </button>
                </div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div>
                    <div
                    class="gmnoprint gm-bundled-control gm-bundled-control-on-bottom"
                    draggable="false"
                    data-control-width="40"
                    data-control-height="72"
                    style="
                        margin: 10px;
                        user-select: none;
                        position: absolute;
                        bottom: 86px;
                        right: 40px;
                    "
                    >
                    <div
                        class="gmnoprint"
                        data-control-width="40"
                        data-control-height="40"
                        style="display: none; position: absolute"
                    >
                        <div
                        style="
                            background-color: rgb(255, 255, 255);
                            box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
                            border-radius: 2px;
                            width: 40px;
                            height: 40px;
                        "
                        >
                        <button
                            draggable="false"
                            aria-label="Xoay bản đồ theo chiều kim đồng hồ"
                            title="Xoay bản đồ theo chiều kim đồng hồ"
                            type="button"
                            class="gm-control-active"
                            style="
                            background: none;
                            display: none;
                            border: 0px;
                            margin: 0px;
                            padding: 0px;
                            text-transform: none;
                            appearance: none;
                            position: relative;
                            cursor: pointer;
                            user-select: none;
                            left: 0px;
                            top: 0px;
                            overflow: hidden;
                            width: 40px;
                            height: 40px;
                            "
                        >
                            <img
                            alt=""
                            src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22none%22%20d%3D%22M0%200h24v24H0V0z%22/%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M12.06%209.06l4-4-4-4-1.41%201.41%201.59%201.59h-.18c-2.3%200-4.6.88-6.35%202.64-3.52%203.51-3.52%209.21%200%2012.72%201.5%201.5%203.4%202.36%205.36%202.58v-2.02c-1.44-.21-2.84-.86-3.95-1.97-2.73-2.73-2.73-7.17%200-9.9%201.37-1.37%203.16-2.05%204.95-2.05h.17l-1.59%201.59%201.41%201.41zm8.94%203c-.19-1.74-.88-3.32-1.91-4.61l-1.43%201.43c.69.92%201.15%202%201.32%203.18H21zm-7.94%207.92V22c1.74-.19%203.32-.88%204.61-1.91l-1.43-1.43c-.91.68-2%201.15-3.18%201.32zm4.6-2.74l1.43%201.43c1.04-1.29%201.72-2.88%201.91-4.61h-2.02c-.17%201.18-.64%202.27-1.32%203.18z%22/%3E%3C/svg%3E"
                            style="width: 20px; height: 20px"
                            /><img
                            alt=""
                            src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22none%22%20d%3D%22M0%200h24v24H0V0z%22/%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M12.06%209.06l4-4-4-4-1.41%201.41%201.59%201.59h-.18c-2.3%200-4.6.88-6.35%202.64-3.52%203.51-3.52%209.21%200%2012.72%201.5%201.5%203.4%202.36%205.36%202.58v-2.02c-1.44-.21-2.84-.86-3.95-1.97-2.73-2.73-2.73-7.17%200-9.9%201.37-1.37%203.16-2.05%204.95-2.05h.17l-1.59%201.59%201.41%201.41zm8.94%203c-.19-1.74-.88-3.32-1.91-4.61l-1.43%201.43c.69.92%201.15%202%201.32%203.18H21zm-7.94%207.92V22c1.74-.19%203.32-.88%204.61-1.91l-1.43-1.43c-.91.68-2%201.15-3.18%201.32zm4.6-2.74l1.43%201.43c1.04-1.29%201.72-2.88%201.91-4.61h-2.02c-.17%201.18-.64%202.27-1.32%203.18z%22/%3E%3C/svg%3E"
                            style="width: 20px; height: 20px"
                            /><img
                            alt=""
                            src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22none%22%20d%3D%22M0%200h24v24H0V0z%22/%3E%3Cpath%20fill%3D%22%23111%22%20d%3D%22M12.06%209.06l4-4-4-4-1.41%201.41%201.59%201.59h-.18c-2.3%200-4.6.88-6.35%202.64-3.52%203.51-3.52%209.21%200%2012.72%201.5%201.5%203.4%202.36%205.36%202.58v-2.02c-1.44-.21-2.84-.86-3.95-1.97-2.73-2.73-2.73-7.17%200-9.9%201.37-1.37%203.16-2.05%204.95-2.05h.17l-1.59%201.59%201.41%201.41zm8.94%203c-.19-1.74-.88-3.32-1.91-4.61l-1.43%201.43c.69.92%201.15%202%201.32%203.18H21zm-7.94%207.92V22c1.74-.19%203.32-.88%204.61-1.91l-1.43-1.43c-.91.68-2%201.15-3.18%201.32zm4.6-2.74l1.43%201.43c1.04-1.29%201.72-2.88%201.91-4.61h-2.02c-.17%201.18-.64%202.27-1.32%203.18z%22/%3E%3C/svg%3E"
                            style="width: 20px; height: 20px"
                            />
                        </button>
                        <div
                            style="
                            position: relative;
                            overflow: hidden;
                            width: 30px;
                            height: 1px;
                            margin: 0px 5px;
                            background-color: rgb(230, 230, 230);
                            display: none;
                            "
                        ></div>
                        <button
                            draggable="false"
                            aria-label="Xoay bản đồ ngược chiều kim đồng hồ"
                            title="Xoay bản đồ ngược chiều kim đồng hồ"
                            type="button"
                            class="gm-control-active"
                            style="
                            background: none;
                            display: none;
                            border: 0px;
                            margin: 0px;
                            padding: 0px;
                            text-transform: none;
                            appearance: none;
                            position: relative;
                            cursor: pointer;
                            user-select: none;
                            left: 0px;
                            top: 0px;
                            overflow: hidden;
                            width: 40px;
                            height: 40px;
                            transform: scaleX(-1);
                            "
                        >
                            <img
                            alt=""
                            src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22none%22%20d%3D%22M0%200h24v24H0V0z%22/%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M12.06%209.06l4-4-4-4-1.41%201.41%201.59%201.59h-.18c-2.3%200-4.6.88-6.35%202.64-3.52%203.51-3.52%209.21%200%2012.72%201.5%201.5%203.4%202.36%205.36%202.58v-2.02c-1.44-.21-2.84-.86-3.95-1.97-2.73-2.73-2.73-7.17%200-9.9%201.37-1.37%203.16-2.05%204.95-2.05h.17l-1.59%201.59%201.41%201.41zm8.94%203c-.19-1.74-.88-3.32-1.91-4.61l-1.43%201.43c.69.92%201.15%202%201.32%203.18H21zm-7.94%207.92V22c1.74-.19%203.32-.88%204.61-1.91l-1.43-1.43c-.91.68-2%201.15-3.18%201.32zm4.6-2.74l1.43%201.43c1.04-1.29%201.72-2.88%201.91-4.61h-2.02c-.17%201.18-.64%202.27-1.32%203.18z%22/%3E%3C/svg%3E"
                            style="width: 20px; height: 20px"
                            /><img
                            alt=""
                            src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22none%22%20d%3D%22M0%200h24v24H0V0z%22/%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M12.06%209.06l4-4-4-4-1.41%201.41%201.59%201.59h-.18c-2.3%200-4.6.88-6.35%202.64-3.52%203.51-3.52%209.21%200%2012.72%201.5%201.5%203.4%202.36%205.36%202.58v-2.02c-1.44-.21-2.84-.86-3.95-1.97-2.73-2.73-2.73-7.17%200-9.9%201.37-1.37%203.16-2.05%204.95-2.05h.17l-1.59%201.59%201.41%201.41zm8.94%203c-.19-1.74-.88-3.32-1.91-4.61l-1.43%201.43c.69.92%201.15%202%201.32%203.18H21zm-7.94%207.92V22c1.74-.19%203.32-.88%204.61-1.91l-1.43-1.43c-.91.68-2%201.15-3.18%201.32zm4.6-2.74l1.43%201.43c1.04-1.29%201.72-2.88%201.91-4.61h-2.02c-.17%201.18-.64%202.27-1.32%203.18z%22/%3E%3C/svg%3E"
                            style="width: 20px; height: 20px"
                            /><img
                            alt=""
                            src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22none%22%20d%3D%22M0%200h24v24H0V0z%22/%3E%3Cpath%20fill%3D%22%23111%22%20d%3D%22M12.06%209.06l4-4-4-4-1.41%201.41%201.59%201.59h-.18c-2.3%200-4.6.88-6.35%202.64-3.52%203.51-3.52%209.21%200%2012.72%201.5%201.5%203.4%202.36%205.36%202.58v-2.02c-1.44-.21-2.84-.86-3.95-1.97-2.73-2.73-2.73-7.17%200-9.9%201.37-1.37%203.16-2.05%204.95-2.05h.17l-1.59%201.59%201.41%201.41zm8.94%203c-.19-1.74-.88-3.32-1.91-4.61l-1.43%201.43c.69.92%201.15%202%201.32%203.18H21zm-7.94%207.92V22c1.74-.19%203.32-.88%204.61-1.91l-1.43-1.43c-.91.68-2%201.15-3.18%201.32zm4.6-2.74l1.43%201.43c1.04-1.29%201.72-2.88%201.91-4.61h-2.02c-.17%201.18-.64%202.27-1.32%203.18z%22/%3E%3C/svg%3E"
                            style="width: 20px; height: 20px"
                            />
                        </button>
                        <div
                            style="
                            position: relative;
                            overflow: hidden;
                            width: 30px;
                            height: 1px;
                            margin: 0px 5px;
                            background-color: rgb(230, 230, 230);
                            display: none;
                            "
                        ></div>
                        <button
                            draggable="false"
                            aria-label="Nghiêng bản đồ"
                            title="Nghiêng bản đồ"
                            type="button"
                            class="gm-tilt gm-control-active"
                            style="
                            background: none;
                            display: block;
                            border: 0px;
                            margin: 0px;
                            padding: 0px;
                            text-transform: none;
                            appearance: none;
                            position: relative;
                            cursor: pointer;
                            user-select: none;
                            top: 0px;
                            left: 0px;
                            overflow: hidden;
                            width: 40px;
                            height: 40px;
                            "
                        >
                            <img
                            alt=""
                            src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2016%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M0%2016h8V9H0v7zm10%200h8V9h-8v7zM0%207h8V0H0v7zm10-7v7h8V0h-8z%22/%3E%3C/svg%3E"
                            style="width: 18px"
                            /><img
                            alt=""
                            src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2016%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M0%2016h8V9H0v7zm10%200h8V9h-8v7zM0%207h8V0H0v7zm10-7v7h8V0h-8z%22/%3E%3C/svg%3E"
                            style="width: 18px"
                            /><img
                            alt=""
                            src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2016%22%3E%3Cpath%20fill%3D%22%23111%22%20d%3D%22M0%2016h8V9H0v7zm10%200h8V9h-8v7zM0%207h8V0H0v7zm10-7v7h8V0h-8z%22/%3E%3C/svg%3E"
                            style="width: 18px"
                            />
                        </button>
                        </div>
                    </div>
                    <button
                        draggable="false"
                        aria-label="Kéo Người hình mắc áo vào bản đồ để mở Chế độ xem phố"
                        title="Kéo Người hình mắc áo vào bản đồ để mở Chế độ xem phố"
                        type="button"
                        style="
                        background: none;
                        display: block;
                        border: 0px;
                        margin: 0px;
                        padding: 0px;
                        text-transform: none;
                        appearance: none;
                        position: absolute;
                        cursor: pointer;
                        user-select: none;
                        left: 20px;
                        top: 72px;
                        "
                    ></button>
                    </div>
                </div>
                <div>
                    <div
                    style="
                        margin: 0px 5px;
                        z-index: 1000000;
                        position: absolute;
                        left: 0px;
                        bottom: 0px;
                    "
                    >
                    <a
                        target="_blank"
                        rel="noopener"
                        title="Mở khu vực này trong Google Maps (mở cửa sổ mới)"
                        aria-label="Mở khu vực này trong Google Maps (mở cửa sổ mới)"
                        href="https://maps.google.com/maps?ll=53.470692,-2.220328&amp;z=14&amp;t=m&amp;hl=vi-VN&amp;gl=US&amp;mapclient=apiv3"
                        style="display: inline"
                        ><div style="width: 66px; height: 26px">
                        <img
                            alt="Google"
                            src="data:image/svg+xml,%3Csvg%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2069%2029%22%3E%3Cg%20opacity%3D%22.6%22%20fill%3D%22%23fff%22%20stroke%3D%22%23fff%22%20stroke-width%3D%221.5%22%3E%3Cpath%20d%3D%22M17.4706%207.33616L18.0118%206.79504%2017.4599%206.26493C16.0963%204.95519%2014.2582%203.94522%2011.7008%203.94522c-4.613699999999999%200-8.50262%203.7551699999999997-8.50262%208.395779999999998C3.19818%2016.9817%207.0871%2020.7368%2011.7008%2020.7368%2014.1712%2020.7368%2016.0773%2019.918%2017.574%2018.3689%2019.1435%2016.796%2019.5956%2014.6326%2019.5956%2012.957%2019.5956%2012.4338%2019.5516%2011.9316%2019.4661%2011.5041L19.3455%2010.9012H10.9508V14.4954H15.7809C15.6085%2015.092%2015.3488%2015.524%2015.0318%2015.8415%2014.403%2016.4629%2013.4495%2017.1509%2011.7008%2017.1509%209.04835%2017.1509%206.96482%2015.0197%206.96482%2012.341%206.96482%209.66239%209.04835%207.53119%2011.7008%207.53119%2013.137%207.53119%2014.176%208.09189%2014.9578%208.82348L15.4876%209.31922%2016.0006%208.80619%2017.4706%207.33616z%22/%3E%3Cpath%20d%3D%22M24.8656%2020.7286C27.9546%2020.7286%2030.4692%2018.3094%2030.4692%2015.0594%2030.4692%2011.7913%2027.953%209.39011%2024.8656%209.39011%2021.7783%209.39011%2019.2621%2011.7913%2019.2621%2015.0594c0%203.25%202.514499999999998%205.6692%205.6035%205.6692zM24.8656%2012.8282C25.8796%2012.8282%2026.8422%2013.6652%2026.8422%2015.0594%2026.8422%2016.4399%2025.8769%2017.2905%2024.8656%2017.2905%2023.8557%2017.2905%2022.8891%2016.4331%2022.8891%2015.0594%2022.8891%2013.672%2023.853%2012.8282%2024.8656%2012.8282z%22/%3E%3Cpath%20d%3D%22M35.7511%2017.2905v0H35.7469C34.737%2017.2905%2033.7703%2016.4331%2033.7703%2015.0594%2033.7703%2013.672%2034.7343%2012.8282%2035.7469%2012.8282%2036.7608%2012.8282%2037.7234%2013.6652%2037.7234%2015.0594%2037.7234%2016.4439%2036.7554%2017.2962%2035.7511%2017.2905zM35.7387%2020.7286C38.8277%2020.7286%2041.3422%2018.3094%2041.3422%2015.0594%2041.3422%2011.7913%2038.826%209.39011%2035.7387%209.39011%2032.6513%209.39011%2030.1351%2011.7913%2030.1351%2015.0594%2030.1351%2018.3102%2032.6587%2020.7286%2035.7387%2020.7286z%22/%3E%3Cpath%20d%3D%22M51.953%2010.4357V9.68573H48.3999V9.80826C47.8499%209.54648%2047.1977%209.38187%2046.4808%209.38187%2043.5971%209.38187%2041.0168%2011.8998%2041.0168%2015.0758%2041.0168%2017.2027%2042.1808%2019.0237%2043.8201%2019.9895L43.7543%2020.0168%2041.8737%2020.797%2041.1808%2021.0844%2041.4684%2021.7772C42.0912%2023.2776%2043.746%2025.1469%2046.5219%2025.1469%2047.9324%2025.1469%2049.3089%2024.7324%2050.3359%2023.7376%2051.3691%2022.7367%2051.953%2021.2411%2051.953%2019.2723v-8.8366zm-7.2194%209.9844L44.7334%2020.4196C45.2886%2020.6201%2045.878%2020.7286%2046.4808%2020.7286%2047.1616%2020.7286%2047.7866%2020.5819%2048.3218%2020.3395%2048.2342%2020.7286%2048.0801%2021.0105%2047.8966%2021.2077%2047.6154%2021.5099%2047.1764%2021.7088%2046.5219%2021.7088%2045.61%2021.7088%2045.0018%2021.0612%2044.7336%2020.4201zM46.6697%2012.8282C47.6419%2012.8282%2048.5477%2013.6765%2048.5477%2015.084%2048.5477%2016.4636%2047.6521%2017.2987%2046.6697%2017.2987%2045.6269%2017.2987%2044.6767%2016.4249%2044.6767%2015.084%2044.6767%2013.7086%2045.6362%2012.8282%2046.6697%2012.8282zM55.7387%205.22083v-.75H52.0788V20.4412H55.7387V5.220829999999999z%22/%3E%3Cpath%20d%3D%22M63.9128%2016.0614L63.2945%2015.6492%2062.8766%2016.2637C62.4204%2016.9346%2061.8664%2017.3069%2061.0741%2017.3069%2060.6435%2017.3069%2060.3146%2017.2088%2060.0544%2017.0447%2059.9844%2017.0006%2059.9161%2016.9496%2059.8498%2016.8911L65.5497%2014.5286%2066.2322%2014.2456%2065.9596%2013.5589%2065.7406%2013.0075C65.2878%2011.8%2063.8507%209.39832%2060.8278%209.39832%2057.8445%209.39832%2055.5034%2011.7619%2055.5034%2015.0676%2055.5034%2018.2151%2057.8256%2020.7369%2061.0659%2020.7369%2063.6702%2020.7369%2065.177%2019.1378%2065.7942%2018.2213L66.2152%2017.5963%2065.5882%2017.1783%2063.9128%2016.0614zM61.3461%2012.8511L59.4108%2013.6526C59.7903%2013.0783%2060.4215%2012.7954%2060.9017%2012.7954%2061.067%2012.7954%2061.2153%2012.8161%2061.3461%2012.8511z%22/%3E%3C/g%3E%3Cpath%20d%3D%22M11.7008%2019.9868C7.48776%2019.9868%203.94818%2016.554%203.94818%2012.341%203.94818%208.12803%207.48776%204.69522%2011.7008%204.69522%2014.0331%204.69522%2015.692%205.60681%2016.9403%206.80583L15.4703%208.27586C14.5751%207.43819%2013.3597%206.78119%2011.7008%206.78119%208.62108%206.78119%206.21482%209.26135%206.21482%2012.341%206.21482%2015.4207%208.62108%2017.9009%2011.7008%2017.9009%2013.6964%2017.9009%2014.8297%2017.0961%2015.5606%2016.3734%2016.1601%2015.7738%2016.5461%2014.9197%2016.6939%2013.7454h-4.9931V11.6512h7.0298C18.8045%2012.0207%2018.8456%2012.4724%2018.8456%2012.957%2018.8456%2014.5255%2018.4186%2016.4637%2017.0389%2017.8434%2015.692%2019.2395%2013.9838%2019.9868%2011.7008%2019.9868z%22%20fill%3D%22%234285F4%22/%3E%3Cpath%20d%3D%22M29.7192%2015.0594C29.7192%2017.8927%2027.5429%2019.9786%2024.8656%2019.9786%2022.1884%2019.9786%2020.0121%2017.8927%2020.0121%2015.0594%2020.0121%2012.2096%2022.1884%2010.1401%2024.8656%2010.1401%2027.5429%2010.1401%2029.7192%2012.2096%2029.7192%2015.0594zM27.5922%2015.0594C27.5922%2013.2855%2026.3274%2012.0782%2024.8656%2012.0782S22.1391%2013.2937%2022.1391%2015.0594C22.1391%2016.8086%2023.4038%2018.0405%2024.8656%2018.0405S27.5922%2016.8168%2027.5922%2015.0594z%22%20fill%3D%22%23E94235%22/%3E%3Cpath%20d%3D%22M40.5922%2015.0594C40.5922%2017.8927%2038.4159%2019.9786%2035.7387%2019.9786%2033.0696%2019.9786%2030.8851%2017.8927%2030.8851%2015.0594%2030.8851%2012.2096%2033.0614%2010.1401%2035.7387%2010.1401%2038.4159%2010.1401%2040.5922%2012.2096%2040.5922%2015.0594zM38.4734%2015.0594C38.4734%2013.2855%2037.2087%2012.0782%2035.7469%2012.0782%2034.2851%2012.0782%2033.0203%2013.2937%2033.0203%2015.0594%2033.0203%2016.8086%2034.2851%2018.0405%2035.7469%2018.0405%2037.2087%2018.0487%2038.4734%2016.8168%2038.4734%2015.0594z%22%20fill%3D%22%23FABB05%22/%3E%3Cpath%20d%3D%22M51.203%2010.4357v8.8366C51.203%2022.9105%2049.0595%2024.3969%2046.5219%2024.3969%2044.132%2024.3969%2042.7031%2022.7955%2042.161%2021.4897L44.0417%2020.7095C44.3784%2021.5143%2045.1997%2022.4588%2046.5219%2022.4588%2048.1479%2022.4588%2049.1499%2021.4487%2049.1499%2019.568V18.8617H49.0759C48.5914%2019.4612%2047.6552%2019.9786%2046.4808%2019.9786%2044.0171%2019.9786%2041.7668%2017.8352%2041.7668%2015.0758%2041.7668%2012.3%2044.0253%2010.1319%2046.4808%2010.1319%2047.6552%2010.1319%2048.5914%2010.6575%2049.0759%2011.2323H49.1499V10.4357H51.203zM49.2977%2015.084C49.2977%2013.3512%2048.1397%2012.0782%2046.6697%2012.0782%2045.175%2012.0782%2043.9267%2013.3429%2043.9267%2015.084%2043.9267%2016.8004%2045.175%2018.0487%2046.6697%2018.0487%2048.1397%2018.0487%2049.2977%2016.8004%2049.2977%2015.084z%22%20fill%3D%22%234285F4%22/%3E%3Cpath%20d%3D%22M54.9887%205.22083V19.6912H52.8288V5.220829999999999H54.9887z%22%20fill%3D%22%2334A853%22/%3E%3Cpath%20d%3D%22M63.4968%2016.6854L65.1722%2017.8023C64.6301%2018.6072%2063.3244%2019.9869%2061.0659%2019.9869%2058.2655%2019.9869%2056.2534%2017.827%2056.2534%2015.0676%2056.2534%2012.1439%2058.2901%2010.1483%2060.8278%2010.1483%2063.3818%2010.1483%2064.6301%2012.1768%2065.0408%2013.2773L65.2625%2013.8357%2058.6843%2016.5623C59.1853%2017.5478%2059.9737%2018.0569%2061.0741%2018.0569%2062.1746%2018.0569%2062.9384%2017.5067%2063.4968%2016.6854zM58.3312%2014.9115L62.7331%2013.0884C62.4867%2012.4724%2061.764%2012.0454%2060.9017%2012.0454%2059.8012%2012.0454%2058.2737%2013.0145%2058.3312%2014.9115z%22%20fill%3D%22%23E94235%22/%3E%3C/svg%3E"
                            draggable="false"
                            style="
                            position: absolute;
                            left: 0px;
                            top: 0px;
                            width: 66px;
                            height: 26px;
                            user-select: none;
                            border: 0px;
                            padding: 0px;
                            margin: 0px;
                            "
                        /></div
                    ></a>
                    </div>
                </div>
                <div></div>
                <div>
                    <div
                    style="
                        display: inline-flex;
                        position: absolute;
                        right: 0px;
                        bottom: 0px;
                    "
                    >
                    <div class="gmnoprint" style="z-index: 1000001">
                        <div
                        draggable="false"
                        class="gm-style-cc"
                        style="
                            user-select: none;
                            position: relative;
                            height: 14px;
                            line-height: 14px;
                        "
                        >
                        <div
                            style="
                            opacity: 0.7;
                            width: 100%;
                            height: 100%;
                            position: absolute;
                            "
                        >
                            <div style="width: 1px"></div>
                            <div
                            style="
                                background-color: rgb(245, 245, 245);
                                width: auto;
                                height: 100%;
                                margin-left: 1px;
                            "
                            ></div>
                        </div>
                        <div
                            style="
                            position: relative;
                            padding-right: 6px;
                            padding-left: 6px;
                            box-sizing: border-box;
                            font-family: Roboto, Arial, sans-serif;
                            font-size: 10px;
                            color: rgb(0, 0, 0);
                            white-space: nowrap;
                            direction: ltr;
                            text-align: right;
                            vertical-align: middle;
                            display: inline-block;
                            "
                        >
                            <button
                            draggable="false"
                            aria-label="Phím tắt"
                            title="Phím tắt"
                            type="button"
                            style="
                                background: none;
                                display: inline-block;
                                border: 0px;
                                margin: 0px;
                                padding: 0px;
                                text-transform: none;
                                appearance: none;
                                position: relative;
                                cursor: pointer;
                                user-select: none;
                                color: rgb(0, 0, 0);
                                font-family: inherit;
                                line-height: inherit;
                            "
                            >
                            <img
                                src="data:image/svg+xml,%3Csvg%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2016%2010%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M1.5%200C.671573%200%200%20.671573%200%201.5v7C0%209.32843.671573%2010%201.5%2010h13C15.3284%2010%2016%209.32843%2016%208.5v-7C16%20.671573%2015.3284%200%2014.5%200h-13zM5%207C4.44772%207%204%207.44772%204%208%204%208.55229%204.44772%209%205%209h6C11.5523%209%2012%208.55229%2012%208%2012%207.44772%2011.5523%207%2011%207H5zM1%204.25c0-.13807.11193-.25.25-.25h1.5c.13807%200%20.25.11193.25.25v1.5c0%20.13807-.11193.25-.25.25H1.5C1.22386%206%201%205.77614%201%205.5V4.25zM1.5%201c-.27614%200-.5.22386-.5.5v1.25c0%20.13807.11193.25.25.25h1.5c.13807%200%20.25-.11193.25-.25v-1.5C3%201.11193%202.88807%201%202.75%201H1.5zM4%204.25c0-.13807.11193-.25.25-.25h1.5c.13807%200%20.25.11193.25.25v1.5c0%20.13807-.11193.25-.25.25h-1.5C4.11193%206%204%205.88807%204%205.75v-1.5zM4.25%201c-.13807%200-.25.11193-.25.25v1.5c0%20.13807.11193.25.25.25h1.5c.13807%200%20.25-.11193.25-.25v-1.5C6%201.11193%205.88807%201%205.75%201h-1.5zM7%204.25c0-.13807.11193-.25.25-.25h1.5C8.88807%204%209%204.11193%209%204.25v1.5C9%205.88807%208.88807%206%208.75%206h-1.5C7.11193%206%207%205.88807%207%205.75v-1.5zM7.25%201c-.13807%200-.25.11193-.25.25v1.5c0%20.13807.11193.25.25.25h1.5C8.88807%203%209%202.88807%209%202.75v-1.5C9%201.11193%208.88807%201%208.75%201h-1.5zM10%204.25C10%204.11193%2010.1119%204%2010.25%204h1.5C11.8881%204%2012%204.11193%2012%204.25v1.5C12%205.88807%2011.8881%206%2011.75%206h-1.5C10.1119%206%2010%205.88807%2010%205.75v-1.5zM10.25%201C10.1119%201%2010%201.11193%2010%201.25v1.5C10%202.88807%2010.1119%203%2010.25%203h1.5C11.8881%203%2012%202.88807%2012%202.75v-1.5C12%201.11193%2011.8881%201%2011.75%201h-1.5zM13%204.25C13%204.11193%2013.1119%204%2013.25%204h1.5C14.8881%204%2015%204.11193%2015%204.25V5.5C15%205.77614%2014.7761%206%2014.5%206h-1.25C13.1119%206%2013%205.88807%2013%205.75v-1.5zM13.25%201C13.1119%201%2013%201.11193%2013%201.25v1.5C13%202.88807%2013.1119%203%2013.25%203h1.5C14.8881%203%2015%202.88807%2015%202.75V1.5C15%201.22386%2014.7761%201%2014.5%201h-1.25z%22%20fill%3D%22%233C4043%22/%3E%3C/svg%3E"
                                alt=""
                                style="height: 9px; vertical-align: -1px"
                            />
                            </button>
                        </div>
                        </div>
                    </div>
                    <div class="gmnoprint" style="z-index: 1000001">
                        <div
                        draggable="false"
                        class="gm-style-cc"
                        style="
                            user-select: none;
                            position: relative;
                            height: 14px;
                            line-height: 14px;
                        "
                        >
                        <div
                            style="
                            opacity: 0.7;
                            width: 100%;
                            height: 100%;
                            position: absolute;
                            "
                        >
                            <div style="width: 1px"></div>
                            <div
                            style="
                                background-color: rgb(245, 245, 245);
                                width: auto;
                                height: 100%;
                                margin-left: 1px;
                            "
                            ></div>
                        </div>
                        <div
                            style="
                            position: relative;
                            padding-right: 6px;
                            padding-left: 6px;
                            box-sizing: border-box;
                            font-family: Roboto, Arial, sans-serif;
                            font-size: 10px;
                            color: rgb(0, 0, 0);
                            white-space: nowrap;
                            direction: ltr;
                            text-align: right;
                            vertical-align: middle;
                            display: inline-block;
                            "
                        >
                            <button
                            draggable="false"
                            aria-label="Dữ liệu Bản đồ"
                            title="Dữ liệu Bản đồ"
                            type="button"
                            style="
                                background: none;
                                border: 0px;
                                margin: 0px;
                                padding: 0px;
                                text-transform: none;
                                appearance: none;
                                position: relative;
                                cursor: pointer;
                                user-select: none;
                                color: rgb(0, 0, 0);
                                font-family: inherit;
                                line-height: inherit;
                                display: none;
                            "
                            >
                            Dữ liệu Bản đồ</button
                            ><span style="">Dữ liệu bản đồ ©2025 Google</span>
                        </div>
                        </div>
                    </div>
                    <div class="gmnoscreen">
                        <div
                        style="
                            font-family: Roboto, Arial, sans-serif;
                            font-size: 11px;
                            color: rgb(0, 0, 0);
                            direction: ltr;
                            text-align: right;
                            background-color: rgb(245, 245, 245);
                        "
                        >
                        Dữ liệu bản đồ ©2025 Google
                        </div>
                    </div>
                    <button
                        draggable="false"
                        aria-label="Tỷ lệ bản đồ: 200 m/35 pixel"
                        title="Tỷ lệ bản đồ: 200 m/35 pixel"
                        type="button"
                        class="gm-style-cc"
                        aria-describedby="F445F9E2-5476-42E9-8392-97F0D5A55EE2"
                        style="
                        background: none;
                        display: none;
                        border: 0px;
                        margin: 0px;
                        padding: 0px;
                        text-transform: none;
                        appearance: none;
                        position: relative;
                        cursor: pointer;
                        user-select: none;
                        height: 14px;
                        line-height: 14px;
                        "
                    >
                        <div
                        style="
                            opacity: 0.7;
                            width: 100%;
                            height: 100%;
                            position: absolute;
                        "
                        >
                        <div style="width: 1px"></div>
                        <div
                            style="
                            background-color: rgb(245, 245, 245);
                            width: auto;
                            height: 100%;
                            margin-left: 1px;
                            "
                        ></div>
                        </div>
                        <div
                        style="
                            position: relative;
                            padding-right: 6px;
                            padding-left: 6px;
                            box-sizing: border-box;
                            font-family: Roboto, Arial, sans-serif;
                            font-size: 10px;
                            color: rgb(0, 0, 0);
                            white-space: nowrap;
                            direction: ltr;
                            text-align: right;
                            vertical-align: middle;
                            display: inline-block;
                        "
                        >
                        <span style="color: rgb(0, 0, 0)">200 m&nbsp;</span>
                        <div
                            style="
                            position: relative;
                            display: inline-block;
                            height: 8px;
                            bottom: -1px;
                            width: 39px;
                            "
                        >
                            <div
                            style="
                                width: 100%;
                                height: 4px;
                                position: absolute;
                                left: 0px;
                                top: 0px;
                            "
                            ></div>
                            <div
                            style="width: 4px; height: 8px; left: 0px; top: 0px"
                            ></div>
                            <div
                            style="
                                width: 4px;
                                height: 8px;
                                position: absolute;
                                right: 0px;
                                bottom: 0px;
                            "
                            ></div>
                            <div
                            style="
                                position: absolute;
                                background-color: rgb(0, 0, 0);
                                height: 2px;
                                left: 1px;
                                bottom: 1px;
                                right: 1px;
                            "
                            ></div>
                            <div
                            style="
                                position: absolute;
                                width: 2px;
                                height: 6px;
                                left: 1px;
                                top: 1px;
                                background-color: rgb(0, 0, 0);
                            "
                            ></div>
                            <div
                            style="
                                width: 2px;
                                height: 6px;
                                position: absolute;
                                background-color: rgb(0, 0, 0);
                                bottom: 1px;
                                right: 1px;
                            "
                            ></div>
                        </div>
                        </div>
                        <span
                        id="F445F9E2-5476-42E9-8392-97F0D5A55EE2"
                        style="display: none"
                        >Nhấp để chuyển đổi giữa các đơn vị hệ mét và hệ đo lường
                        Anh</span
                        >
                    </button>
                    <div
                        class="gmnoprint gm-style-cc"
                        draggable="false"
                        style="
                        z-index: 1000001;
                        user-select: none;
                        position: relative;
                        height: 14px;
                        line-height: 14px;
                        "
                    >
                        <div
                        style="
                            opacity: 0.7;
                            width: 100%;
                            height: 100%;
                            position: absolute;
                        "
                        >
                        <div style="width: 1px"></div>
                        <div
                            style="
                            background-color: rgb(245, 245, 245);
                            width: auto;
                            height: 100%;
                            margin-left: 1px;
                            "
                        ></div>
                        </div>
                        <div
                        style="
                            position: relative;
                            padding-right: 6px;
                            padding-left: 6px;
                            box-sizing: border-box;
                            font-family: Roboto, Arial, sans-serif;
                            font-size: 10px;
                            color: rgb(0, 0, 0);
                            white-space: nowrap;
                            direction: ltr;
                            text-align: right;
                            vertical-align: middle;
                            display: inline-block;
                        "
                        >
                        <a
                            aria-label="Điều khoản (mở trong thẻ mới)"
                            href="https://www.google.com/intl/vi-VN_US/help/terms_maps.html"
                            target="_blank"
                            rel="noopener"
                            style="
                            text-decoration: none;
                            cursor: pointer;
                            color: rgb(0, 0, 0);
                            "
                            >Điều khoản</a
                        >
                        </div>
                    </div>
                    <div
                        draggable="false"
                        class="gm-style-cc"
                        style="
                        user-select: none;
                        position: relative;
                        height: 14px;
                        line-height: 14px;
                        display: none;
                        "
                    >
                        <div
                        style="
                            opacity: 0.7;
                            width: 100%;
                            height: 100%;
                            position: absolute;
                        "
                        >
                        <div style="width: 1px"></div>
                        <div
                            style="
                            background-color: rgb(245, 245, 245);
                            width: auto;
                            height: 100%;
                            margin-left: 1px;
                            "
                        ></div>
                        </div>
                        <div
                        style="
                            position: relative;
                            padding-right: 6px;
                            padding-left: 6px;
                            box-sizing: border-box;
                            font-family: Roboto, Arial, sans-serif;
                            font-size: 10px;
                            color: rgb(0, 0, 0);
                            white-space: nowrap;
                            direction: ltr;
                            text-align: right;
                            vertical-align: middle;
                            display: inline-block;
                        "
                        >
                        <a
                            target="_blank"
                            rel="noopener"
                            title="Báo cáo lỗi trong bản đồ đường hoặc hình ảnh đến Google"
                            dir="ltr"
                            href="https://www.google.com/maps/@53.470692,-2.220328,14z/data=!10m1!1e1!12b1?source=apiv3&amp;rapsrc=apiv3"
                            style="
                            font-family: Roboto, Arial, sans-serif;
                            font-size: 10px;
                            text-decoration: none;
                            position: relative;
                            color: rgb(0, 0, 0);
                            "
                            ><img
                            src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M12%2021q-1.625%200-3.012-.8Q7.6%2019.4%206.8%2018H4v-2h2.1q-.075-.5-.087-1Q6%2014.5%206%2014H4v-2h2q0-.5.013-1%20.012-.5.087-1H4V8h2.8q.35-.575.788-1.075.437-.5%201.012-.875L7%204.4%208.4%203l2.15%202.15q.7-.225%201.425-.225.725%200%201.425.225L15.6%203%2017%204.4l-1.65%201.65q.575.375%201.038.862Q16.85%207.4%2017.2%208H20v2h-2.1q.075.5.088%201%20.012.5.012%201h2v2h-2q0%20.5-.012%201-.013.5-.088%201H20v2h-2.8q-.8%201.4-2.188%202.2-1.387.8-3.012.8zm0-2q1.65%200%202.825-1.175Q16%2016.65%2016%2015v-4q0-1.65-1.175-2.825Q13.65%207%2012%207q-1.65%200-2.825%201.175Q8%209.35%208%2011v4q0%201.65%201.175%202.825Q10.35%2019%2012%2019zm-2-3h4v-2h-4zm0-4h4v-2h-4zm2%201z%22/%3E%3C/svg%3E"
                            alt=""
                            style="height: 12px; vertical-align: -2px"
                        /></a>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
    </div>
    `
}) 

export class MapDoctorComponent {}