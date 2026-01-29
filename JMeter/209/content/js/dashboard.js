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

    var data = {"OkPercent": 99.79545181085308, "KoPercent": 0.20454818914691372};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7114664361855373, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.09771754636233952, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9690647482014388, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.978076379066478, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.17897727272727273, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.17142857142857143, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9633977900552486, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.3779385171790235, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9704264099037139, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9501385041551247, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.15123456790123457, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7962184873949579, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.3486238532110092, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9622222222222222, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4113573407202216, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.128125, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.16666666666666666, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.6958041958041958, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.962109955423477, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9515449438202247, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8311, 17, 0.20454818914691372, 576.8487546624941, 1, 36812, 181.0, 1182.0, 1535.7999999999993, 3004.919999999993, 4.2819811594889865, 1752.037028135504, 20.627229990554756], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 6, 0, 0.0, 24426.833333333332, 23931, 25001, 24396.0, 25001.0, 25001.0, 25001.0, 0.0037074363139679516, 1.4986188930800084, 0.01624960164369189], "isController": false}, {"data": ["2.0 Register attendance", 701, 16, 2.282453637660485, 2104.088445078459, 526, 8778, 1979.0, 3187.4000000000015, 3900.0999999999976, 5340.84, 0.3971894174234135, 776.8868380843317, 8.266532969660904], "isController": true}, {"data": ["2.5 Select patient", 695, 0, 0.0, 176.52374100719427, 81, 5900, 107.0, 273.5999999999999, 554.7999999999967, 1065.1599999999999, 0.39418712942156015, 160.1143149986572, 1.6418363632805897], "isController": false}, {"data": ["2.3 Search by first/last name", 707, 0, 0.0, 162.64922206506364, 77, 2360, 108.0, 285.8000000000002, 462.0000000000002, 849.7999999999994, 0.39863932613602343, 162.36040388292042, 1.7257694017393532], "isController": false}, {"data": ["4.0 Vaccination for flu", 176, 0, 0.0, 1838.9147727272716, 267, 8777, 1642.0, 2576.7000000000003, 3177.2500000000005, 6186.719999999966, 0.10243552091372485, 121.01227117792556, 1.7147781454325397], "isController": true}, {"data": ["4.0 Vaccination for hpv", 175, 0, 0.0, 1890.2457142857133, 383, 6180, 1651.0, 2798.4, 3435.199999999999, 5536.280000000008, 0.10289723329919105, 121.58278058532062, 1.7283037324942405], "isController": true}, {"data": ["1.2 Sign-in page", 724, 0, 0.0, 353.31906077348077, 15, 24914, 123.0, 343.0, 615.25, 2541.5, 0.4032293996560297, 161.9351594663671, 1.9740039739538315], "isController": false}, {"data": ["7.1 Name search", 6, 0, 0.0, 5558.5, 4803, 7050, 5366.0, 7050.0, 7050.0, 7050.0, 0.003748217254168486, 1.5151814414362919, 0.016255086057506397], "isController": false}, {"data": ["2.4 Patient attending session", 553, 16, 2.8933092224231465, 1260.6455696202534, 153, 3848, 1092.0, 1849.6, 2236.999999999998, 3146.880000000001, 0.31892021573539653, 130.02784530232108, 1.6227556413338478], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 27.0, 27, 27, 27.0, 27.0, 27.0, 27.0, 37.03703703703704, 11.610243055555555, 21.846064814814817], "isController": false}, {"data": ["1.1 Homepage", 727, 0, 0.0, 356.53232462173366, 29, 29171, 129.0, 333.4000000000001, 498.0, 1825.8000000000045, 0.403898986363548, 162.3325191419716, 1.964586332540258], "isController": false}, {"data": ["1.3 Sign-in", 722, 0, 0.0, 397.7008310249313, 91, 24687, 138.0, 459.8000000000002, 618.5000000000002, 2496.1799999999957, 0.40285614966608135, 162.2293330950442, 2.115071615945571], "isController": false}, {"data": ["Run some searches", 6, 1, 16.666666666666668, 108741.33333333334, 106542, 117058, 107207.5, 117058.0, 117058.0, 117058.0, 0.0035562531080170394, 7.653813781399492, 0.07586789060550543], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 162, 0, 0.0, 1877.1296296296298, 362, 5403, 1677.5, 2860.1000000000026, 3330.049999999999, 4798.8300000000045, 0.09780848615406165, 116.36595541306576, 1.645653958028688], "isController": true}, {"data": ["2.1 Open session", 714, 0, 0.0, 574.5924369747896, 202, 7093, 417.5, 976.0, 1350.0, 2338.6500000000033, 0.40037098801915055, 161.28828525668882, 1.6689166652881717], "isController": false}, {"data": ["4.3 Vaccination confirm", 654, 0, 0.0, 1488.1100917431193, 924, 8528, 1298.0, 2219.0, 2667.75, 3938.9000000000055, 0.39075406572435584, 157.8232230744533, 2.3609849420396407], "isController": false}, {"data": ["4.1 Vaccination questions", 675, 0, 0.0, 228.945185185185, 106, 3988, 144.0, 412.79999999999995, 575.5999999999964, 1346.9600000000007, 0.3916462720496851, 154.608704079112, 2.2390539762540516], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 27.0, 27, 27, 27.0, 27.0, 27.0, 27.0, 37.03703703703704, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 722, 0, 0.0, 1721.1288088642657, 508, 78691, 1030.0, 1763.4, 2106.55, 5074.309999999996, 0.40317199194326103, 669.6303282867731, 7.712362479331851], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 160, 0, 0.0, 1975.2625000000005, 535, 4588, 1748.5, 2957.7000000000003, 3589.2499999999995, 4511.1399999999985, 0.09638902610937745, 114.3701977274028, 1.6217630136480836], "isController": true}, {"data": ["7.0 Open Children Search", 6, 0, 0.0, 20430.333333333332, 87, 24571, 24488.5, 24571.0, 24571.0, 24571.0, 0.003796612915064707, 1.6999080972499234, 0.015793267070837204], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["7.5 year group", 6, 0, 0.0, 24962.833333333332, 24172, 26604, 24774.5, 26604.0, 26604.0, 26604.0, 0.0037094212499142196, 1.842407469646115, 0.016337392419055793], "isController": false}, {"data": ["7.2 No Consent search", 6, 1, 16.666666666666668, 29353.0, 27521, 36812, 27981.5, 36812.0, 36812.0, 36812.0, 0.003699955785528363, 1.6386191229285643, 0.014209660923718628], "isController": false}, {"data": ["1.4 Open Sessions list", 715, 0, 0.0, 618.732867132868, 409, 4383, 522.0, 841.8, 1093.3999999999999, 2008.8400000000015, 0.3999067070786843, 183.6199692985958, 1.664168699001408], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 1.0, 1, 1, 1.0, 1.0, 1.0, 1.0, 1000.0, 286.1328125, 614.2578125], "isController": false}, {"data": ["4.2 Vaccination batch", 673, 0, 0.0, 219.741456166419, 101, 1980, 146.0, 414.8000000000003, 623.0, 1335.739999999999, 0.3919241495740955, 155.75516470987276, 2.0407055613774765], "isController": false}, {"data": ["2.2 Session register", 712, 0, 0.0, 216.01966292134827, 76, 2834, 107.0, 430.70000000000005, 658.6500000000004, 1641.3700000000008, 0.4002210209345948, 169.5071473064549, 1.6718485940901633], "isController": false}, {"data": ["7.3 Due vaccination", 6, 0, 0.0, 24440.166666666668, 24140, 24690, 24494.0, 24690.0, 24690.0, 24690.0, 0.003706625531360214, 1.498195838633293, 0.016194768190728123], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 1, 5.882352941176471, 0.01203224642040669], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 16, 94.11764705882354, 0.19251594272650704], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8311, 17, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 16, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 553, 16, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 16, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.2 No Consent search", 6, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
