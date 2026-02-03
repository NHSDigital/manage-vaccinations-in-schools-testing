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

    var data = {"OkPercent": 99.9655223366005, "KoPercent": 0.034477663399497614};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5925257015837733, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9230769230769231, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.021913580246913582, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.8594427244582044, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.46153846153846156, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.8849475632325725, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.12342569269521411, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.10290556900726393, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.23076923076923078, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.832427536231884, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.33762057877813506, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.859987929993965, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8275966183574879, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.09383033419023136, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.2730911330049261, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.38461538461538464, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.29731457800511507, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.8137562814070352, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.15384615384615385, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.11654589371980677, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.13239074550128535, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.48148148148148145, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.9038461538461539, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.4175384615384615, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.8271410579345088, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.8487369069624153, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.8461538461538461, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20303, 7, 0.034477663399497614, 792.7845638575607, 0, 19490, 318.0, 1935.0, 2855.0, 5848.990000000002, 5.295321844095898, 678.7726746942892, 39.70021421978637], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 26, 0, 0.0, 269.38461538461536, 93, 1582, 168.0, 585.0000000000001, 1269.7999999999988, 1582.0, 0.007676321412301422, 1.3256087904139868, 0.056436416513066426], "isController": false}, {"data": ["2.0 Register attendance", 1620, 7, 0.43209876543209874, 3991.216049382711, 960, 27837, 3145.5, 6881.300000000001, 9553.999999999993, 17455.989999999998, 0.4536054069764512, 283.41721571602386, 14.565821202713737], "isController": true}, {"data": ["2.5 Select patient", 1615, 0, 0.0, 518.1188854489159, 82, 17163, 186.0, 1163.6000000000004, 1961.9999999999918, 5723.439999999974, 0.45328638240698715, 59.44834815925382, 3.232015560177767], "isController": false}, {"data": ["7.1 Full name search", 26, 0, 0.0, 1608.8461538461536, 446, 15666, 904.5, 2494.4000000000005, 11202.449999999983, 15666.0, 0.007674828157645692, 1.3779836286506353, 0.05601552200786493], "isController": false}, {"data": ["2.3 Search by first/last name", 1621, 0, 0.0, 401.19494139420055, 94, 9062, 188.0, 848.8, 1541.8999999999999, 3277.56, 0.4539248114573871, 62.33668180691548, 3.3574991866947106], "isController": false}, {"data": ["4.0 Vaccination for flu", 397, 0, 0.0, 3137.3576826196463, 269, 21438, 2292.0, 6201.199999999999, 7432.499999999995, 13264.519999999979, 0.11300937123806178, 43.52255396268641, 3.1657818698880695], "isController": true}, {"data": ["4.0 Vaccination for hpv", 413, 0, 0.0, 3053.486682808717, 262, 23810, 2333.0, 5465.4000000000015, 6936.3, 14071.72000000003, 0.11832414053126107, 42.35516930692924, 3.330004004541584], "isController": true}, {"data": ["7.6 First name search", 26, 0, 0.0, 3041.8846153846152, 849, 15282, 1650.5, 8654.600000000002, 13435.749999999993, 15282.0, 0.00765625082820021, 1.9730066937165442, 0.05582558282105163], "isController": false}, {"data": ["1.2 Sign-in page", 1656, 0, 0.0, 516.3502415458942, 18, 7811, 220.5, 1272.1999999999994, 1880.4499999999996, 4167.600000000014, 0.46103335503939247, 61.37764685929031, 3.8654198226698955], "isController": false}, {"data": ["2.4 Patient attending session", 622, 7, 1.1254019292604502, 1793.8135048231513, 270, 16096, 1036.5, 3515.600000000003, 5674.200000000001, 13977.979999999996, 0.17543157012383437, 32.48249679192208, 1.519950638893856], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 22.0, 22, 22, 22.0, 22.0, 22.0, 22.0, 45.45454545454545, 14.24893465909091, 26.811079545454547], "isController": false}, {"data": ["1.1 Homepage", 1657, 0, 0.0, 482.1617380808697, 37, 10380, 214.0, 1107.6000000000001, 1792.2999999999997, 4549.440000000017, 0.4602329050695335, 61.70519495225951, 3.8502835057783256], "isController": false}, {"data": ["1.3 Sign-in", 1656, 0, 0.0, 536.591183574878, 93, 16159, 240.0, 1205.2999999999995, 1887.1499999999971, 4627.170000000001, 0.4610794381958652, 61.14415437376725, 4.023945786308892], "isController": false}, {"data": ["Run some searches", 26, 0, 0.0, 12602.884615384615, 6417, 29599, 10543.5, 27438.5, 28986.149999999998, 29599.0, 0.0076226640565883125, 13.114431902362616, 0.4467690243554378], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 389, 0, 0.0, 3005.285347043702, 376, 25271, 2266.0, 5214.0, 6814.5, 15843.000000000047, 0.11268516286916704, 38.16982194250609, 3.1653122955046733], "isController": true}, {"data": ["2.1 Open session", 1624, 0, 0.0, 1905.20812807882, 171, 15652, 1509.5, 3417.0, 4769.25, 8207.75, 0.453354333539818, 60.218347027336236, 3.2349364957601323], "isController": false}, {"data": ["7.7 Partial name search", 26, 0, 0.0, 1658.3461538461536, 473, 6671, 1094.5, 4781.500000000001, 6280.399999999999, 6671.0, 0.007677608932720817, 2.0234210881881167, 0.05597381785862038], "isController": false}, {"data": ["4.3 Vaccination confirm", 1564, 0, 0.0, 1920.5517902813315, 590, 19490, 1285.0, 3695.5, 5171.0, 11196.199999999977, 0.4503946712896435, 55.005646694501955, 4.590854478730803], "isController": false}, {"data": ["4.1 Vaccination questions", 1592, 0, 0.0, 593.8241206030153, 107, 17357, 245.5, 1507.7000000000005, 2251.5999999999985, 4882.869999999991, 0.45283903335933173, 52.34828481260514, 4.201523101030749], "isController": false}, {"data": ["7.7 Last name search", 26, 0, 0.0, 2688.807692307692, 964, 13253, 1705.5, 5737.200000000001, 10949.299999999992, 13253.0, 0.00767726434268001, 1.9775507194039608, 0.05599466267724515], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 36.0, 36, 36, 36.0, 36.0, 36.0, 36.0, 27.777777777777775, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1656, 0, 0.0, 2665.9522946859934, 505, 19180, 2116.5, 4555.4, 6021.749999999994, 10799.780000000015, 0.46104888621614176, 271.48360828175765, 14.971703311665985], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 389, 0, 0.0, 2999.7223650385604, 251, 22610, 2170.0, 5513.0, 8339.0, 14716.900000000007, 0.11195488189479465, 37.657402938319194, 3.145022514101566], "isController": true}, {"data": ["7.0 Open Children Search", 27, 0, 0.0, 1387.1111111111113, 325, 6301, 909.0, 3126.5999999999976, 6152.199999999999, 6301.0, 0.0076214735865130405, 1.9264724466440395, 0.054344899766331264], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.380208333333334, 13.715277777777779], "isController": false}, {"data": ["7.5 year group", 26, 0, 0.0, 2588.807692307692, 1861, 4122, 2436.5, 3413.8, 3882.949999999999, 4122.0, 0.007675068308107943, 1.977968651847684, 0.056614583271834384], "isController": false}, {"data": ["7.2 No Consent search", 26, 0, 0.0, 348.03846153846143, 90, 3057, 137.0, 746.9000000000002, 2320.2499999999973, 3057.0, 0.00767811453856894, 1.2712337934566518, 0.05658485484893605], "isController": false}, {"data": ["Debug Sampler", 1621, 0, 0.0, 0.2831585441085751, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.45394438747191906, 2.5327719436849923, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1625, 0, 0.0, 1152.2867692307675, 444, 16206, 931.0, 1891.0, 2595.0999999999995, 4217.520000000002, 0.45335304093875606, 87.29889656877658, 3.232091687409312], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 11.0, 90.9090909090909, 26.012073863636367, 55.84161931818182], "isController": false}, {"data": ["4.2 Vaccination batch", 1588, 0, 0.0, 563.4395465994968, 103, 10689, 239.0, 1383.1000000000001, 2056.95, 4953.66999999999, 0.4527500574490785, 53.7009860375218, 3.9697130561085046], "isController": false}, {"data": ["2.2 Session register", 1623, 0, 0.0, 477.11891558841705, 90, 7222, 212.0, 1101.0, 1807.7999999999997, 3950.4399999999996, 0.4538874918339404, 66.57863363740836, 3.242721606093335], "isController": false}, {"data": ["7.3 Due vaccination", 26, 0, 0.0, 398.7692307692308, 93, 1952, 192.0, 1343.7000000000003, 1851.5499999999995, 1952.0, 0.007678062387800623, 1.2753785340127828, 0.05634424267874603], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, 100.0, 0.034477663399497614], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20303, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 622, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
