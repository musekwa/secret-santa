import { cn } from "../../lib/utils";
import { createLink, type LinkComponent } from "@tanstack/react-router";

type BasicLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  ref: React.Ref<HTMLAnchorElement>;
};

const BasicLinkComponent = ({ className, ref, ...props }: BasicLinkProps) => {
  return <a ref={ref} {...props} className={cn("custom-link", className)} />;
};

const CreatedLinkComponent = createLink(BasicLinkComponent);

export const CustomLink: LinkComponent<typeof BasicLinkComponent> = (props) => {
  return (
    <CreatedLinkComponent
      activeProps={{ className: "active-custom-link" }}
      inactiveProps={{ className: "inactive-custom-link" }}
      {...props}
    />
  );
};
