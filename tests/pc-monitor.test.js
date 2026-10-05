// Libre Hardware Monitor reports every reading as a formatted string, so the
// gauges only work as long as the component parses the number back out. It
// stopped doing that at some point and every figure rendered as "NaN%" - which
// nobody saw, because the block was separately failing to load at all. One
// realistic payload through the component covers both halves.
import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

const get = vi.fn();
vi.mock("axios", () => ({ default: { get, defaults: {} } }));

const { default: PCMonitor } = await import(
  "../src/components/blocks/PCMonitor.vue"
);

// Shaped like the real /data.json: a root node, the machine, then one node per
// piece of hardware. Values carry their units, and a sensor with nothing to
// report is "-" (Intel package temperatures do this unless the monitor runs
// elevated).
function sensorTree({ cpuTemp = "-" } = {}) {
  return {
    Text: "Sensor",
    Children: [
      {
        Text: "TERRA",
        Children: [
          {
            Text: "13th Gen Intel Core i5-13600K",
            Children: [
              { SensorId: "/intelcpu/0/load/0", Value: "5.6 %" },
              { SensorId: "/intelcpu/0/temperature/14", Value: cpuTemp },
            ],
          },
          {
            Text: "NVIDIA GeForce RTX 4070",
            Children: [
              { SensorId: "/gpu-nvidia/0/load/0", Value: "12.0 %" },
              { SensorId: "/gpu-nvidia/0/temperature/0", Value: "45.0 °C" },
            ],
          },
          {
            Text: "Generic Memory",
            Children: [
              { SensorId: "/ram/load/0", Value: "20.0 %" },
              { SensorId: "/ram/data/0", Value: "12.8 GB" },
              { SensorId: "/ram/data/1", Value: "51.0 GB" },
            ],
          },
        ],
      },
    ],
  };
}

async function mountWith(data) {
  get.mockResolvedValue({ data });
  const wrapper = mount(PCMonitor);
  await flushPromises();
  return wrapper;
}

let mounted = null;
afterEach(() => {
  mounted?.unmount();
  mounted = null;
  get.mockReset();
});

describe("PCMonitor", () => {
  it("reads the load percentages out of the formatted values", async () => {
    mounted = await mountWith(sensorTree());
    const text = mounted.text();

    expect(text).not.toContain("NaN");
    expect(text).toContain("6%"); // CPU, 5.6 rounded
    expect(text).toContain("12%"); // GPU
    expect(text).toContain("20%"); // memory
  });

  it("names the hardware and adds up the memory", async () => {
    mounted = await mountWith(sensorTree());
    const text = mounted.text();

    expect(text).toContain("i5-13600K");
    expect(text).toContain("RTX 4070");
    expect(text).toContain("Total 63.8 GB");
  });

  it("shows a temperature only where there is one to show", async () => {
    mounted = await mountWith(sensorTree());

    // The GPU reports one and the CPU does not, so exactly one thermometer.
    expect(mounted.findAll(".mdi-thermometer")).toHaveLength(1);
    expect(mounted.text()).toContain("45°");
  });

  it("shows the CPU temperature once the sensor reports one", async () => {
    mounted = await mountWith(sensorTree({ cpuTemp: "52.0 °C" }));

    expect(mounted.findAll(".mdi-thermometer")).toHaveLength(2);
    expect(mounted.text()).toContain("52°");
  });

  // The PC being off is the common case, and it must not look like 0% load.
  it("reports offline rather than zeroes when the request fails", async () => {
    get.mockRejectedValue(new Error("unreachable"));
    mounted = mount(PCMonitor);
    await flushPromises();

    expect(mounted.text()).toContain("Offline");
    expect(mounted.text()).not.toContain("0%");
  });
});
