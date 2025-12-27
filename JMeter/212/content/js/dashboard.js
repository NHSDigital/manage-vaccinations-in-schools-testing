/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 83.1896551724138, "KoPercent": 16.810344827586206};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.36037781545168324, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.625, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.05136986301369863, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.6649122807017543, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.690068493150685, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.007042253521126761, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6314102564102564, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.17647058823529413, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.6565495207667732, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.46763754045307443, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.022388059701492536, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.32323232323232326, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.024793388429752067, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.2114695340501792, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.03398058252427184, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.007462686567164179, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.2, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.41721854304635764, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.18525179856115107, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.5836177474402731, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.5, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3248, 546, 16.810344827586206, 1653.2589285714262, 4, 26308, 595.5, 4479.5, 6616.949999999997, 13787.009999999987, 3.9058929920006156, 1215.5383431194864, 17.811105601913983], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 4, 0, 0.0, 800.25, 101, 1632, 734.0, 1632.0, 1632.0, 1632.0, 0.009986568065951296, 3.0828701412225556, 0.043718054685198404], "isController": false}, {"data": ["2.0 Register attendance", 292, 0, 0.0, 7733.609589041092, 687, 30869, 5921.5, 17567.2, 21300.949999999993, 29172.23, 0.5096679827271426, 653.7431619727467, 8.678822048965653], "isController": true}, {"data": ["2.5 Select patient", 285, 0, 0.0, 1365.0771929824557, 79, 20671, 324.0, 4251.200000000003, 5380.399999999995, 11938.699999999884, 0.5058779467390397, 158.3330821046564, 2.106852335891419], "isController": false}, {"data": ["2.3 Search by first/last name", 292, 0, 0.0, 1465.3664383561638, 70, 22855, 297.5, 3660.1, 6499.299999999965, 19668.59999999999, 0.5104689846387295, 158.6217905573727, 2.2094913715226485], "isController": false}, {"data": ["4.0 Vaccination for flu", 71, 50, 70.4225352112676, 3084.7183098591554, 78, 15631, 1820.0, 9407.799999999997, 10897.199999999988, 15631.0, 0.1382016654273935, 113.12108935516271, 1.9050232016994912], "isController": true}, {"data": ["4.0 Vaccination for hpv", 71, 52, 73.2394366197183, 3180.8450704225347, 132, 16881, 1657.0, 9844.8, 11764.399999999994, 16881.0, 0.1410773541041588, 120.54277330943133, 1.96654892627218], "isController": true}, {"data": ["1.2 Sign-in page", 312, 0, 0.0, 1236.7692307692307, 14, 13896, 458.5, 3752.4999999999995, 5205.249999999999, 7738.9900000000025, 0.5236797228525775, 157.95371295952057, 2.4635852061107717], "isController": false}, {"data": ["7.1 Name search", 4, 0, 0.0, 7195.75, 6056, 8603, 7062.0, 8603.0, 8603.0, 8603.0, 0.00971680375457297, 3.030990398127815, 0.04211247564726059], "isController": false}, {"data": ["2.4 Patient attending session", 17, 0, 0.0, 3859.882352941176, 967, 9520, 2940.0, 7807.999999999998, 9520.0, 9520.0, 0.03581473249554949, 10.901370489582126, 0.18309582481855624], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 34.0, 34, 34, 34.0, 34.0, 34.0, 34.0, 29.41176470588235, 9.219898897058822, 17.348345588235293], "isController": false}, {"data": ["1.1 Homepage", 313, 0, 0.0, 1243.9233226837057, 32, 18115, 371.0, 3673.0, 5429.9000000000015, 9568.18000000001, 0.5187787980243312, 162.8885289207785, 2.4078479407340803], "isController": false}, {"data": ["1.3 Sign-in", 309, 0, 0.0, 2325.4466019417487, 95, 20165, 991.0, 5840.0, 9166.5, 17756.299999999985, 0.5216070222822417, 159.88580120326216, 2.7737045545661716], "isController": false}, {"data": ["Run some searches", 4, 0, 0.0, 16056.25, 11745, 26037, 13221.5, 26037.0, 26037.0, 26037.0, 0.010089697409974674, 17.88482864619593, 0.22063330508218057], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 67, 47, 70.14925373134328, 3578.3880597014927, 101, 19144, 2539.0, 9058.800000000001, 11177.399999999996, 19144.0, 0.13698826194609204, 110.9284354694557, 1.9027367686206917], "isController": true}, {"data": ["2.1 Open session", 297, 0, 0.0, 2940.5791245791247, 266, 26308, 1605.0, 6840.799999999999, 10326.499999999989, 20441.659999999953, 0.5071322949358487, 155.62652315776083, 2.111982363812781], "isController": false}, {"data": ["4.3 Vaccination confirm", 242, 165, 68.18181818181819, 1705.611570247934, 13, 14251, 302.0, 5615.000000000002, 7948.2, 12491.579999999987, 0.5131641446698785, 152.84251163697772, 2.504512219721195], "isController": false}, {"data": ["4.1 Vaccination questions", 279, 191, 68.45878136200717, 1033.906810035842, 56, 16948, 277.0, 2985.0, 4138.0, 11452.399999999987, 0.5353555317193355, 152.56380163110742, 2.749532313455461], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 38.0, 38, 38, 38.0, 38.0, 38.0, 38.0, 26.31578947368421, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 309, 0, 0.0, 6640.847896440124, 672, 27237, 5213.0, 14118.0, 17772.0, 23897.799999999963, 0.5225022616400484, 665.5774471024587, 9.77862084344378], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 67, 41, 61.19402985074627, 3782.6716417910457, 117, 18375, 2849.0, 8634.60000000001, 13190.999999999982, 18375.0, 0.13387201835045698, 112.99535144401952, 1.9177974450175632], "isController": true}, {"data": ["7.0 Open Children Search", 5, 0, 0.0, 1695.8, 232, 2535, 1872.0, 2535.0, 2535.0, 2535.0, 0.009430136831285423, 3.743882198730703, 0.03918848073423045], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.380208333333334, 13.715277777777779], "isController": false}, {"data": ["7.5 year group", 4, 0, 0.0, 2443.5, 1574, 4250, 1975.0, 4250.0, 4250.0, 4250.0, 0.009914708718251244, 4.409748246180978, 0.04361648837748271], "isController": false}, {"data": ["7.2 No Consent search", 4, 0, 0.0, 3654.25, 1977, 7644, 2498.0, 7644.0, 7644.0, 7644.0, 0.009875226513008142, 4.372232429194626, 0.043375293016486696], "isController": false}, {"data": ["1.4 Open Sessions list", 302, 0, 0.0, 1885.9602649006627, 391, 19371, 958.5, 4360.8, 6335.249999999993, 18304.549999999857, 0.5136019482860661, 183.07923294580053, 2.1335121391606178], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 4.0, 4, 4, 4.0, 4.0, 4.0, 4.0, 250.0, 71.533203125, 153.564453125], "isController": false}, {"data": ["4.2 Vaccination batch", 278, 190, 68.34532374100719, 911.2194244604318, 15, 15655, 177.5, 2975.4, 4332.550000000001, 9458.759999999984, 0.5418163320593504, 155.06137367250125, 2.478074283896166], "isController": false}, {"data": ["2.2 Session register", 293, 0, 0.0, 1785.583617747443, 73, 22803, 545.0, 5419.000000000007, 6861.200000000003, 16391.460000000003, 0.5081653323713458, 172.6905268383488, 2.1206661778682725], "isController": false}, {"data": ["7.3 Due vaccination", 4, 0, 0.0, 1962.5, 320, 6455, 537.5, 6455.0, 6455.0, 6455.0, 0.009969816380906804, 2.636347072519198, 0.043508414992360626], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 190, 34.798534798534796, 5.849753694581281], "isController": false}, {"data": ["Test failed: text expected to contain /Which batch did you use?/", 191, 34.98168498168498, 5.880541871921182], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 165, 30.21978021978022, 5.080049261083744], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3248, 546, "Test failed: text expected to contain /Which batch did you use?/", 191, "Test failed: text expected to contain /Check and confirm/", 190, "Test failed: text expected to contain /Vaccination outcome recorded for/", 165, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 242, 165, "Test failed: text expected to contain /Vaccination outcome recorded for/", 165, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 279, 191, "Test failed: text expected to contain /Which batch did you use?/", 191, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 278, 190, "Test failed: text expected to contain /Check and confirm/", 190, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
