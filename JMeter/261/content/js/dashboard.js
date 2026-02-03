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

    var data = {"OkPercent": 99.73643551758612, "KoPercent": 0.26356448241388714};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.773411401930913, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.42105263157894735, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9453216374269006, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.2795321637426901, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4052341597796143, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.24461538461538462, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9625730994152046, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9771929824561404, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.3415559772296015, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.33114446529080677, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9468319559228651, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5023540489642184, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.8636363636363636, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9514619883040936, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9545454545454546, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9426997245179063, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9681286549707603, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.23692307692307693, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.835672514619883, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 22006, 58, 0.26356448241388714, 330.14064346087633, 0, 5264, 171.0, 809.0, 1106.0, 2007.9700000000048, 6.6533092549206705, 2608.580229879359, 50.23566382167855], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1710, 11, 0.6432748538011696, 1074.2245614035064, 19, 5264, 860.0, 1904.8000000000002, 2400.499999999998, 3581.89, 0.5602965967715775, 234.44648978073073, 5.7223649728207], "isController": false}, {"data": ["4.1 Vaccination questions", 1710, 11, 0.6432748538011696, 234.1280701754383, 21, 2757, 147.0, 483.7000000000003, 669.4499999999998, 1129.5799999999972, 0.5597357523519539, 229.27683800465826, 5.205288048283264], "isController": false}, {"data": ["2.0 Register attendance", 1710, 25, 1.4619883040935673, 1533.6128654970776, 410, 5551, 1396.5, 2601.7000000000003, 2998.5999999999985, 4080.7899999999986, 0.5576119079816438, 1098.5096410405952, 19.13119472743294], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 38.0, 38, 38, 38.0, 38.0, 38.0, 38.0, 26.31578947368421, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1815, 0, 0.0, 1117.849035812672, 476, 4281, 984.0, 1820.8000000000002, 2116.999999999998, 2745.5999999999926, 0.5687353487977123, 983.3272990680927, 18.514814273048117], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 325, 0, 0.0, 1673.9046153846157, 726, 5331, 1513.0, 2617.8, 3001.3999999999996, 4789.820000000001, 0.15410073920939207, 191.33981767141336, 4.368976828138558], "isController": true}, {"data": ["2.5 Select patient", 1710, 0, 0.0, 180.84035087719323, 54, 3227, 111.0, 390.8000000000002, 582.4999999999982, 1069.119999999999, 0.5588081895791096, 235.4615366946422, 3.999697125859127], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["2.3 Search by first/last name", 1710, 0, 0.0, 156.99999999999994, 58, 1494, 105.0, 312.0, 478.34999999999945, 798.2299999999991, 0.5577495880481113, 237.1869827285379, 4.140846349223163], "isController": false}, {"data": ["4.0 Vaccination for flu", 527, 0, 0.0, 1435.2182163187854, 689, 5520, 1207.0, 2303.6, 2957.599999999995, 4267.1600000000035, 0.176477817542029, 218.8374046706889, 4.998498528423645], "isController": true}, {"data": ["4.0 Vaccination for hpv", 533, 11, 2.0637898686679175, 1410.416510318948, 64, 5637, 1187.0, 2400.0, 2967.2999999999965, 4250.299999999994, 0.17414083713715078, 215.48231351748237, 4.915417324085083], "isController": true}, {"data": ["1.2 Sign-in page", 1815, 0, 0.0, 218.9349862258952, 13, 1917, 129.0, 516.0, 694.3999999999996, 1231.5599999999993, 0.5687989786062638, 237.10779575774285, 4.7423008876476285], "isController": false}, {"data": ["Debug Sampler", 1710, 0, 0.0, 0.33801169590643254, 0, 22, 0.0, 1.0, 1.0, 1.0, 0.5577650517465711, 3.1308822323331182, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 1062, 25, 2.354048964218456, 868.9971751412432, 19, 3703, 720.5, 1457.0, 1806.85, 2784.8599999999915, 0.34813325833061254, 148.41660120984912, 3.0212656443817125], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 31.0, 31, 31, 31.0, 31.0, 31.0, 31.0, 32.25806451612903, 10.112147177419354, 19.027217741935484], "isController": false}, {"data": ["1.4 Open Sessions list", 1815, 0, 0.0, 447.0975206611578, 235, 3104, 363.0, 734.8000000000002, 925.1999999999998, 1367.7599999999989, 0.5691708826601698, 272.19041136590346, 4.073092379883776], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1710, 11, 0.6432748538011696, 220.06023391812903, 17, 1711, 139.0, 455.0, 640.6999999999989, 1081.589999999996, 0.5599876082274297, 230.92374249010768, 4.922831671081617], "isController": false}, {"data": ["1.1 Homepage", 1815, 0, 0.0, 213.02699724517905, 25, 2803, 132.0, 448.60000000000036, 697.0, 1136.7999999999984, 0.5688285704256781, 236.87167831978462, 4.729941045933142], "isController": false}, {"data": ["1.3 Sign-in", 1815, 0, 0.0, 238.78953168044012, 64, 2974, 137.0, 534.4000000000001, 722.0, 1186.0399999999995, 0.5689813916438421, 237.53375565621187, 4.976054166362322], "isController": false}, {"data": ["2.2 Session register", 1710, 0, 0.0, 177.32982456140374, 55, 2017, 105.0, 379.50000000000045, 552.0, 985.3899999999935, 0.5575966345945343, 241.96145306799204, 3.9997534122631477], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 325, 0, 0.0, 1727.5538461538458, 730, 5130, 1516.0, 2787.6000000000004, 3297.7, 4594.800000000001, 0.1544201949305513, 192.21931176656346, 4.377725757722079], "isController": true}, {"data": ["2.1 Open session", 1710, 0, 0.0, 478.4116959064329, 107, 4349, 368.0, 874.9000000000001, 1141.4499999999998, 1773.4599999999982, 0.5576308190487992, 233.6958144900246, 3.995097572145525], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 11, 18.96551724137931, 0.0499863673543579], "isController": false}, {"data": ["Test failed: text expected to contain /Which batch did you use?/", 11, 18.96551724137931, 0.0499863673543579], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 25, 43.10344827586207, 0.11360538035081341], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 11, 18.96551724137931, 0.0499863673543579], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 22006, 58, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 25, "Test failed: text expected to contain /Check and confirm/", 11, "Test failed: text expected to contain /Which batch did you use?/", 11, "Test failed: text expected to contain /Vaccination outcome recorded for/", 11, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["4.3 Vaccination confirm", 1710, 11, "Test failed: text expected to contain /Vaccination outcome recorded for/", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 1710, 11, "Test failed: text expected to contain /Which batch did you use?/", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1062, 25, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 25, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 1710, 11, "Test failed: text expected to contain /Check and confirm/", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
