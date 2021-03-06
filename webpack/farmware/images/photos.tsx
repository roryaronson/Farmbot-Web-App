import * as React from "react";
import * as _ from "lodash";
import * as moment from "moment";
import { t } from "i18next";
import { success, error } from "farmbot-toastr";
import { Widget, WidgetHeader, WidgetBody } from "../../ui/index";
import { ImageFlipper } from "./image_flipper";
import { PhotosProps } from "./interfaces";
import { devices } from "../../device";
import { ToolTips } from "../../constants";
import { selectImage } from "./actions";
import { WidgetFooter } from "../../ui/widget_footer";
import { safeStringFetch } from "../../util";
import { destroy } from "../../api/crud";

interface MetaInfoProps {
  /** Default conversion is `attr_name ==> Attr Name`.
   *  Setting a label property will over ride it to a differrent value.
   */
  label?: string;
  attr: string;
  // tslint:disable-next-line:no-any
  obj: any; /** Really, it's OK here! See safeStringFetch */
}

function MetaInfo({ obj, attr, label }: MetaInfoProps) {
  const top = label || _.startCase(attr.split("_").join());
  const bottom = safeStringFetch(obj, attr);
  return (
    <div>
      <label>{top}:&nbsp;&nbsp;</label>
      <span>{bottom || "unknown"}</span>
    </div>
  );
}

export class Photos extends React.Component<PhotosProps, {}> {

  takePhoto = () => {
    const ok = () => success(t("Processing now. Refresh page to see result."));
    const no = () => error(t("Error taking photo"));
    devices.current.takePhoto().then(ok, no);
  }

  metaDatas() {
    const i = this.props.currentImage;
    if (i) {
      const { meta } = i.body;
      return Object.keys(meta).sort().map(function (key, index) {
        return <MetaInfo key={index} attr={key} obj={meta} />;
      });
    } else {
      return <MetaInfo attr={t("image")} obj={{ image: t("No meta data.") }} />;
    }
  }

  destroy = () => {
    const img = this.props.currentImage || this.props.images[0];
    if (img && img.uuid) {
      this.props.dispatch(destroy(img.uuid))
        .then(() => success(t("Image Deleted."), t("Success")))
        .catch(() => error(t("Could not delete image."), t("Error")));
    }
  }

  render() {
    const image = this.props.currentImage;
    return (
      <Widget className="photos-widget">
        <WidgetHeader helpText={ToolTips.PHOTOS} title={"Photos"}>
          <button
            className="fb-button gray"
            onClick={this.takePhoto}>
            {t("Take Photo")}
          </button>
          <button
            className="fb-button red"
            onClick={() => this.destroy()}>
            {t("Delete Photo")}
          </button>
        </WidgetHeader>
        <WidgetBody>
          <ImageFlipper
            onFlip={id => { this.props.dispatch(selectImage(id)); }}
            currentImage={this.props.currentImage}
            images={this.props.images} />
        </WidgetBody>
        <WidgetFooter>
          {/** Separated from <MetaInfo /> for stylistic purposes. */}
          {image ?
            <div>
              <label>{t("Created At")}</label>
              <span>
                {moment(image.body.created_at).format("MMMM Do, YYYY h:mma")}
              </span>
            </div>
            : ""}
          <div className="image-metadatas">
            {this.metaDatas()}
          </div>
        </WidgetFooter>
      </Widget>
    );
  }
}
