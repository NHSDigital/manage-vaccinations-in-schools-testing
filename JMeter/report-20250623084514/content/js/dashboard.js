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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.38573439699671513, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.5408163265306123, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5285714285714286, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.6268656716417911, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.085, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.03125, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.9714285714285714, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.6666666666666666, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.05612244897959184, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9785714285714285, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.3357142857142857, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.2926829268292683, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.625, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.5744186046511628, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.6, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.6, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.014285714285714285, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.007692307692307693, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7193877551020408, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.6, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.4791666666666667, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.6580188679245284, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.07, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1746, 0, 0.0, 3003.9009163803, 86, 30033, 836.5, 9631.399999999998, 16368.099999999995, 22922.959999999992, 2.911261546670224, 92.17552052504001, 3.7119893881098474], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 100, 0, 0.0, 33307.32999999999, 8775, 81592, 30407.5, 57590.7, 66151.75, 81543.91999999997, 0.22657446596398373, 80.22585420697804, 0.9666565050378833], "isController": true}, {"data": ["2.5 Select patient", 98, 0, 0.0, 2230.1836734693875, 330, 22717, 644.0, 6560.30000000002, 13577.299999999997, 22717.0, 0.23790623095839797, 5.766807969009072, 0.16495451560592045], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 4063.542857142857, 362, 21014, 598.5, 15609.099999999999, 17869.250000000007, 21014.0, 0.7439764478313087, 10.689575661076216, 1.0752784597561884], "isController": false}, {"data": ["2.5 Select menacwy", 67, 0, 0.0, 975.1194029850747, 337, 5476, 605.0, 2569.4000000000015, 3636.5999999999985, 5476.0, 0.20284712592870682, 4.583228038581826, 0.14143832804013345], "isController": false}, {"data": ["2.3 Search by first/last name", 100, 0, 0.0, 6228.000000000003, 980, 24226, 3554.0, 16321.000000000002, 18388.7, 24210.569999999992, 0.23264254008430965, 25.65519681995096, 0.20068372552018873], "isController": false}, {"data": ["2.5 Select td_ipv", 63, 0, 0.0, 512.2539682539683, 344, 1462, 412.0, 710.4000000000001, 993.7999999999996, 1462.0, 0.2575391520830012, 5.903028748574337, 0.17932169476091783], "isController": false}, {"data": ["4.0 Vaccination for hpv", 96, 0, 0.0, 3397.3541666666656, 855, 10991, 2851.0, 6040.9, 7562.199999999996, 10991.0, 0.24274974776784022, 11.876995158754543, 1.3837061580680154], "isController": true}, {"data": ["5.8 Consent confirm", 3, 0, 0.0, 1169.3333333333333, 990, 1449, 1069.0, 1449.0, 1449.0, 1449.0, 0.01640123993373899, 1.3261512987048487, 0.03563745981696216], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 183.97142857142853, 86, 3493, 89.0, 98.6, 238.7500000000005, 3493.0, 1.12307272698102, 6.768048631054565, 0.6766951880344623], "isController": false}, {"data": ["5.9 Patient home page", 3, 0, 0.0, 650.0, 383, 888, 679.0, 888.0, 888.0, 888.0, 0.016699973836707654, 0.3607672733396051, 0.012443437536531193], "isController": false}, {"data": ["2.4 Patient attending session", 98, 0, 0.0, 6948.540816326531, 1090, 30033, 3955.0, 18286.000000000004, 22891.249999999996, 30033.0, 0.23513942808332575, 21.65414064337027, 0.3494943452566619], "isController": false}, {"data": ["5.4 Consent route", 5, 0, 0.0, 436.8, 397, 464, 448.0, 464.0, 464.0, 464.0, 0.014207047832288641, 0.16148030246094483, 0.02210139374690997], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 325.4857142857142, 250, 4394, 260.5, 283.8, 307.05, 4394.0, 1.1103532509556968, 5.730680596973494, 0.6018027873832147], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 6248.0142857142855, 451, 27075, 1152.5, 19516.1, 23710.75, 27075.0, 0.791407574901074, 7.679910525014132, 1.2450757843414357], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 51, 0, 0.0, 3361.6078431372543, 2161, 10709, 2851.0, 5188.200000000002, 6286.4, 10709.0, 0.44675315574165403, 24.593614085207214, 2.647506901131775], "isController": true}, {"data": ["2.1 Open session", 100, 0, 0.0, 9764.179999999995, 2570, 26185, 7105.0, 19891.200000000004, 21772.399999999994, 26160.13999999999, 0.22897547214742356, 3.876460827734883, 0.1426400914871499], "isController": false}, {"data": ["4.3 Vaccination confirm", 205, 0, 0.0, 1774.0926829268287, 855, 9869, 1408.0, 2731.8, 4293.499999999996, 8975.399999999998, 0.5584020440238724, 11.280157540879115, 1.299936656268131], "isController": false}, {"data": ["5.6 Consent questions", 4, 0, 0.0, 527.5, 409, 576, 562.5, 576.0, 576.0, 576.0, 0.011592791602181764, 0.13920406791057321, 0.02248367590032518], "isController": false}, {"data": ["4.1 Vaccination questions", 215, 0, 0.0, 802.8511627906973, 415, 5165, 615.0, 1048.0, 2190.799999999998, 4550.200000000001, 0.5210820086136068, 6.043583265118043, 1.0216175377723866], "isController": false}, {"data": ["5.3 Consent parent details", 5, 0, 0.0, 1332.8, 398, 4605, 615.0, 4605.0, 4605.0, 4605.0, 0.014122099673779497, 0.1596183414300038, 0.025502526090579146], "isController": false}, {"data": ["5.2 Consent who", 5, 0, 0.0, 746.2, 427, 1594, 545.0, 1594.0, 1594.0, 1594.0, 0.013990122973180934, 0.2695776469312665, 0.022009851669721178], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 14181.37142857143, 1459, 40978, 8407.0, 32525.1, 36950.700000000004, 40978.0, 0.7208543153428691, 33.90902520866158, 3.431801550094226], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 65, 0, 0.0, 3078.400000000001, 1066, 7630, 2649.0, 5616.8, 6075.599999999998, 7630.0, 0.25478106467127365, 13.168590529101877, 1.5013211561866722], "isController": true}, {"data": ["2.5 Select hpv", 98, 0, 0.0, 987.2653061224488, 326, 19387, 487.0, 1451.0000000000005, 2190.5499999999965, 19387.0, 0.24027499227687527, 4.841661289338901, 0.1790330264719295], "isController": false}, {"data": ["5.1 Consent start", 5, 0, 0.0, 598.0, 536, 677, 613.0, 677.0, 677.0, 677.0, 0.013977842324347444, 0.1596395175617611, 0.02971656517588319], "isController": false}, {"data": ["5.5 Consent agree", 5, 0, 0.0, 574.4, 425, 681, 575.0, 681.0, 681.0, 681.0, 0.014143871460496168, 0.2228902868730729, 0.0217406774207236], "isController": false}, {"data": ["1.5 Open Sessions list", 72, 0, 0.0, 3428.8888888888882, 286, 17723, 1204.5, 10633.800000000003, 16696.6, 17723.0, 0.4939457345727713, 5.818815816554043, 0.295919909614791], "isController": false}, {"data": ["4.2 Vaccination batch", 212, 0, 0.0, 768.2264150943396, 401, 4616, 531.0, 962.1000000000007, 2685.349999999997, 4535.52, 0.5391383958089618, 10.844112889254106, 0.8637270882076191], "isController": false}, {"data": ["5.0 Consent for hpv", 3, 0, 0.0, 7517.333333333333, 5668, 10151, 6733.0, 10151.0, 10151.0, 10151.0, 0.015071590052750565, 3.0064682240643053, 0.22709432303441346], "isController": true}, {"data": ["5.7 Consent triage", 3, 0, 0.0, 629.6666666666666, 552, 690, 647.0, 690.0, 690.0, 690.0, 0.01647383131894985, 0.26304504357328384, 0.026593010908421973], "isController": false}, {"data": ["2.2 Session register", 100, 0, 0.0, 8203.06, 741, 26984, 6302.0, 18144.4, 22693.899999999983, 26974.399999999994, 0.23062039191629402, 25.975981895146134, 0.14569173001040098], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1746, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
